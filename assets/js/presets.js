const EXAM_PRESETS = {
    neet: {
        id: "neet",
        name: "NEET 2026",
        widthMm: 35,
        heightMm: 45,
        minKb: 10,
        maxKb: 200,
        format: "jpg",
        guidelines: [
            "White background is mandatory.",
            "Face must cover 80% of the photo.",
            "Name and Date of photo must be printed at the bottom.",
            "Both ears must be visible."
        ]
    },
    jee: {
        id: "jee",
        name: "JEE Main 2026",
        widthMm: 35,
        heightMm: 45,
        minKb: 10,
        maxKb: 200,
        format: "jpg",
        guidelines: [
            "Recent passport size photograph required.",
            "Background should be white or light-colored.",
            "Spectacles are allowed only if being used regularly.",
            "No cap or goggles allowed."
        ]
    },
    ssc: {
        id: "ssc",
        name: "SSC CGL / CHSL",
        widthMm: 35,
        heightMm: 45,
        minKb: 20,
        maxKb: 50,
        format: "jpg",
        guidelines: [
            "Photo must not be older than 3 months.",
            "Dimensions: 3.5 cm width x 4.5 cm height.",
            "Frontal view of full face is required.",
            "Strictly no caps, no spectacles, no masks."
        ]
    },
    upsc: {
        id: "upsc",
        name: "UPSC Civil Services",
        widthMm: 35,
        heightMm: 45,
        minKb: 20,
        maxKb: 300,
        format: "jpg",
        guidelines: [
            "Photograph should be clear and in color.",
            "Background should be plain white.",
            "Name of candidate and date of photo mandatory.",
            "The photo should look natural (no heavy editing)."
        ]
    },
    gate: {
        id: "gate",
        name: "GATE 2026",
        widthMm: 35,
        heightMm: 45,
        minKb: 20,
        maxKb: 200,
        format: "jpg",
        guidelines: [
            "Face must cover 60-70% of the area.",
            "Only high-quality JPEG images accepted.",
            "No selfies or mobile-portraits.",
            "Background must be white."
        ]
    }
};
