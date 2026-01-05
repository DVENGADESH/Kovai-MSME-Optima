export const animations = {
    container: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    },
    item: {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    },
    fadeIn: {
        hidden: { opacity: 0 },
        show: { opacity: 1 }
    },
    slideUp: {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4 } }
    }
};
