document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('id');
    const preset = EXAM_PRESETS[examId];

    if (!preset) {
        alert("No exam selected. Returning to homepage.");
        window.location.href = "/";
        return;
    }

    // Initialize UI
    document.getElementById('tool-heading').innerText = preset.name + " Photo Maker";
    const ruleList = document.getElementById('rule-list');
    ruleList.innerHTML = `
        <li>Dimension: ${preset.widthMm}mm x ${preset.heightMm}mm</li>
        <li>File Size: ${preset.minKb}KB to ${preset.maxKb}KB</li>
        <li>Format: ${preset.format.toUpperCase()}</li>
    `;

    const fileInput = document.getElementById('fileInput');
    const imageToCrop = document.getElementById('image-to-crop');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultBox = document.getElementById('validation-result');
    
    let cropper;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imageToCrop.src = event.target.result;
                step1.style.display = 'none';
                step2.style.display = 'block';
                
                if (cropper) cropper.destroy();
                cropper = new Cropper(imageToCrop, {
                    aspectRatio: preset.widthMm / preset.heightMm,
                    viewMode: 1,
                    autoCropArea: 1,
                });
            };
            reader.readAsDataURL(file);
        }
    });

    downloadBtn.addEventListener('click', () => {
        // High quality canvas based on mm to px (300 DPI)
        const canvas = cropper.getCroppedCanvas({
            width: preset.widthMm * 3.78, 
            height: preset.heightMm * 3.78
        });

        // Iterative compression logic to stay under maxKb
        let quality = 0.95;
        function compressAndDownload() {
            canvas.toBlob((blob) => {
                const sizeKb = blob.size / 1024;

                if (sizeKb > preset.maxKb && quality > 0.1) {
                    quality -= 0.05;
                    compressAndDownload();
                } else {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `${preset.id}-photo-official.jpg`;
                    link.href = url;
                    link.click();

                    resultBox.innerHTML = `
                        <div class="success-alert">
                            ✔ Photo generated successfully!<br>
                            Final Size: ${sizeKb.toFixed(2)} KB <br>
                            Status: Ready for Upload.
                        </div>
                    `;
                }
            }, 'image/jpeg', quality);
        }
        compressAndDownload();
    });

    document.getElementById('resetBtn').onclick = () => location.reload();
});
