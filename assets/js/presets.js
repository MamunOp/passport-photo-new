const EXAM_PRESETS = {
    neet: {
        id: "neet",
        name: "NEET (UG) 2026",
        widthMm: 35,
        heightMm: 45,
        maxKb: 200,
        minKb: 10,
        guidelines: ["White Background", "80% Face Coverage", "No Mask", "Name/Date at bottom"],
        faq: [
            { q: "What is the official photo size for NEET 2026?", a: "The size must be 3.5 cm x 4.5 cm in JPG format." },
            { q: "Is a white background mandatory?", a: "Yes, NTA specifies a highly visible white background." },
            { q: "Can I wear glasses in the NEET photo?", a: "Only if worn regularly; however, eyes must be clearly visible without glare." },
            { q: "Should I include my name on the photo?", a: "Yes, your name and the date of taking the photo must be printed at the bottom." },
            { q: "What is the file size limit?", a: "Between 10KB and 200KB." },
            { q: "Can I use a polaroid photo?", a: "No, polaroid or mobile selfies are rejected. Use a professional studio-style photo." },
            { q: "Is the post-card size photo different?", a: "Yes, this tool creates the passport size. Post-card size is 4x6 inches." },
            { q: "Can I wear a cap?", a: "No, caps and mufflers are not allowed." },
            { q: "How old can the photo be?", a: "Not more than 3 months old." },
            { q: "Does the face need to be centered?", a: "Yes, at least 80% of the photo should cover your face and ears." }
        ]
    }
};
