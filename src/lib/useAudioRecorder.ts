import { useState, useRef, useCallback } from "react";

export interface AudioRecorderState {
    isRecording: boolean;
    recordingTime: number;
    audioBlob: Blob | null;
    error: string | null;
}

export const useAudioRecorder = () => {
    const [state, setState] = useState<AudioRecorderState>({
        isRecording: false,
        recordingTime: 0,
        audioBlob: null,
        error: null,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Setup audio context for visualization
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 2048;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            sourceRef.current = source;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setState(prev => ({ ...prev, isRecording: false, audioBlob: blob }));
                stopTimer();
            };

            mediaRecorder.start();
            setState(prev => ({ ...prev, isRecording: true, error: null, audioBlob: null, recordingTime: 0 }));
            startTimer();
        } catch (err: any) {
            setState(prev => ({ ...prev, error: err.message || "Could not access microphone" }));
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            streamRef.current?.getTracks().forEach(track => track.stop());
            audioContextRef.current?.close();
        }
    }, []);

    const startTimer = () => {
        timerRef.current = window.setInterval(() => {
            setState(prev => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    return {
        ...state,
        startRecording,
        stopRecording,
        analyser: analyserRef.current
    };
};
