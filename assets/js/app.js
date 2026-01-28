document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('id');
    const preset = EXAM_PRESETS[examId];

    if (!preset) {
        alert("Invalid Exam ID");
        window.location.href = "/";
        return;
    }

    // UI Updates
    document.getElementById('tool-title').innerText = `${preset.name} Photo Tool`;
    document.getElementById('rules-summary').innerHTML = `Requirement: ${preset.widthMm}x${preset.heightMm}mm | Max: ${preset.maxKb}KB`;

    const uploadInput = document.getElementById('upload');
    const image = document.getElementById('image-to-crop');
    const downloadBtn = document.getElementById('download-btn');
    let cropper;

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            image.src = event.target.result;
            image.style.display = 'block';
            if (cropper) cropper.destroy();
            
            cropper = new Cropper(image, {
                aspectRatio: preset.widthMm / preset.heightMm,
                viewMode: 1
            });
            downloadBtn.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });

    downloadBtn.addEventListener('click', () => {
        // Calculate pixels (assuming 300 DPI for high quality)
        const canvas = cropper.getCroppedCanvas({
            width: (preset.widthMm * 3.78), // mm to px conversion
            height: (preset.heightMm * 3.78)
        });

        // Compression Logic
        let quality = 0.9;
        canvas.toBlob((blob) => {
            const sizeKb = blob.size / 1024;
            
            const validationBox = document.getElementById('validation-box');
            if(sizeKb <= preset.maxKb) {
                const link = document.createElement('a');
                link.download = `${preset.id}-photo.jpg`;
                link.href = URL.createObjectURL(blob);
                link.click();
                
                validationBox.innerHTML = `<p class="success">✔ Size: ${sizeKb.toFixed(2)} KB (Valid)</p>`;
            } else {
                validationBox.innerHTML = `<p class="error">❌ Size: ${sizeKb.toFixed(2)} KB (Too Large). Try again.</p>`;
            }
        }, 'image/jpeg', quality);
    });
});
