const EXAM_PRESETS = {
    neet: {
        id: "neet",
        name: "NEET 2026",
        widthMm: 35,
        heightMm: 45,
        maxKb: 200,
        minKb: 10,
        format: "jpg",
        guidelines: [
            "White background mandatory",
            "80% face coverage",
            "Name and Date of taking photo printed at bottom",
            "No spectacles or caps"
        ],
        faq: [
            { q: "What is the NEET photo size for 2026?", a: "The size should be 3.5 cm x 4.5 cm." },
            { q: "Is a white background mandatory for NEET?", a: "Yes, a white background is strictly required." },
            // ... Add 8 more
        ]
    },
    ssc: {
        id: "ssc",
        name: "SSC CGL/CHSL",
        widthMm: 35,
        heightMm: 45,
        maxKb: 50,
        minKb: 20,
        format: "jpg",
        guidelines: [
            "Photo must be without cap and spectacles",
            "Frontal view of full face",
            "Not older than 3 months"
        ],
        faq: [
            { q: "What is the SSC photo KB limit?", a: "It must be between 20KB and 50KB." },
            // ... Add 9 more
        ]
    }
    // Add UPSC, GATE, JEE similarly
};
