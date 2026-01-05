import { useEffect, useRef, useState } from "react";
import { Mic, Square, Activity, CheckCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAudioRecorder } from "../lib/useAudioRecorder";
import { analyzeAudio, type AudioAnalysisResult } from "../lib/gemini";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { cn } from "../lib/utils";

export const AcousticDiagnostics = () => {
    const { t, language } = useLanguage();
    const { isRecording, recordingTime, audioBlob, error: recorderError, startRecording, stopRecording, analyser } = useAudioRecorder();
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AudioAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    // Oscilloscope visualizer
    useEffect(() => {
        if (!isRecording || !analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = "rgb(17, 20, 24)"; // industrial-900
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgb(34, 197, 94)"; // brand-green
            ctx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isRecording, analyser]);

    const handleAnalyze = async () => {
        if (!audioBlob) return;
        setAnalyzing(true);
        setError(null);
        try {
            const data = await analyzeAudio(audioBlob, language);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 h-[calc(100vh-6rem)]">
            {/* Recorder Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => window.history.back()}>
                        <span className="text-brand-blue hover:underline">← {t.dashboard}</span>
                    </Button>
                </div>

                <Card className="flex-1 flex flex-col bg-industrial-950 border-industrial-800 shadow-xl overflow-hidden relative">
                    {/* Industrial Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

                    <CardHeader className="relative z-10 border-b border-industrial-800 pb-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl text-industrial-100 flex items-center gap-2">
                                <Activity className="text-brand-orange" />
                                {t.recordAudio}
                            </CardTitle>
                            <div className={cn("px-2 py-1 rounded text-xs font-mono font-bold", isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-industrial-800 text-industrial-400")}>
                                {isRecording ? "REC" : "READY"}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col items-center justify-center p-0 relative">
                        {/* Visualizer Canvas */}
                        <canvas
                            ref={canvasRef}
                            width={500}
                            height={300}
                            className="w-full h-full absolute inset-0 opacity-50"
                        />

                        {/* Timer Big Display */}
                        <div className="relative z-10 text-6xl font-mono font-bold tracking-widest text-industrial-200 mb-8 drop-shadow-md">
                            {formatTime(recordingTime)}
                        </div>

                        {/* Controls */}
                        <div className="relative z-10 flex gap-4">
                            {!isRecording ? (
                                <Button
                                    size="icon"
                                    className="w-20 h-20 rounded-full bg-brand-orange hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.4)] border-4 border-industrial-900"
                                    onClick={startRecording}
                                    disabled={analyzing || !!result}
                                >
                                    <Mic className="w-8 h-8 text-white" />
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)] border-4 border-industrial-900"
                                    onClick={stopRecording}
                                >
                                    <Square className="w-8 h-8 text-white fill-current" />
                                </Button>
                            )}
                        </div>

                        {recorderError && <p className="text-red-500 mt-4 relative z-10">{recorderError}</p>}
                        {error && <p className="text-red-500 mt-4 relative z-10">{error}</p>}
                    </CardContent>

                    <CardFooter className="bg-industrial-900/50 border-t border-industrial-800 p-4 justify-between relative z-10">
                        <p className="text-sm text-industrial-400">Status: {isRecording ? "Listening..." : audioBlob ? "Audio Captured" : "Idle"}</p>
                        {audioBlob && !isRecording && !result && !analyzing && (
                            <Button size="sm" onClick={handleAnalyze} className="bg-brand-blue hover:bg-blue-600">
                                Analyze Diagnostics
                            </Button>
                        )}
                        {result && (
                            <Button size="sm" variant="outline" onClick={() => { setResult(null); }}>
                                Reset
                            </Button>
                        )}
                    </CardFooter>

                    {/* Analysis Overlay */}
                    {analyzing && (
                        <div className="absolute inset-0 bg-industrial-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center">
                            <div className="relative">
                                <Activity className="w-16 h-16 text-brand-blue animate-pulse" />
                                <div className="absolute inset-0 border-4 border-brand-blue/30 rounded-full animate-ping" />
                            </div>
                            <h3 className="text-xl font-bold text-white mt-6 mb-2">Analyzing Sound Frequencies for Faults... / இயந்திர சத்தத்தை பகுப்பாய்வு செய்கிறது...</h3>
                            <p className="text-industrial-400 text-sm">Checking frequencies & alignment</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Analysis Result Section */}
            <div className="h-full overflow-y-auto">
                {!result ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/5">
                        <Activity className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium mb-2">Diagnostic Terminal</h3>
                        <p className="max-w-xs">Record machine sound to detect anomalies using spectral analysis.</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-500">
                        <Card className="border-l-4 border-l-brand-orange shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center text-2xl">
                                    Machine Health
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-sm font-bold uppercase",
                                        result.status === 'Healthy' ? "bg-green-500/20 text-green-500" :
                                            result.status === 'Critical' ? "bg-red-500/20 text-red-500" :
                                                "bg-yellow-500/20 text-yellow-500"
                                    )}>
                                        {result.status}
                                    </span>
                                </CardTitle>
                                <CardDescription>Health Score: {result.healthScore}/100</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg leading-relaxed text-foreground">{result.description}</p>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Maintenance Protocol</h4>
                            {result.maintenanceTips.map((tip, idx) => (
                                <Card key={idx} className="bg-muted/30 border-none">
                                    <div className="p-4 flex gap-4">
                                        <div className="bg-brand-blue/10 p-2 rounded-full h-fit">
                                            <CheckCircle className="w-5 h-5 text-brand-blue" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">{tip}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
