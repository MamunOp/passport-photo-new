let cropper;
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const previewImg = document.getElementById('previewImg');
const downloadBtn = document.getElementById('downloadBtn');

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('id');
    const preset = EXAM_PRESETS[examId];

    if (!preset) { window.location.href = "/"; return; }

    // UI Initialization
    document.getElementById('exam-name').innerText = preset.name;
    document.getElementById('spec-size').innerText = `${preset.widthMm}mm x ${preset.heightMm}mm`;
    document.getElementById('spec-kb').innerText = `Max ${preset.maxKb} KB`;

    uploadBox.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadBox.style.display = 'none';
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                
                if (cropper) cropper.destroy();
                cropper = new Cropper(previewImg, {
                    aspectRatio: preset.widthMm / preset.heightMm,
                    viewMode: 1,
                    guides: true,
                    background: false,
                    autoCropArea: 1
                });
                downloadBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    };

    downloadBtn.onclick = () => {
        // 1. Get cropped canvas at target resolution (300 DPI approx)
        const canvas = cropper.getCroppedCanvas({
            width: preset.widthMm * 3.78, 
            height: preset.heightMm * 3.78
        });

        // 2. Iterative Compression (The Pi7 Secret)
        let quality = 0.95;
        const targetKb = preset.maxKb;
        
        function process() {
            canvas.toBlob((blob) => {
                const currentKb = blob.size / 1024;
                
                // If file is still too big, lower quality and try again
                if (currentKb > targetKb && quality > 0.1) {
                    quality -= 0.05;
                    process();
                } else {
                    // Final Result
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `${preset.id}-official-photo.jpg`;
                    link.href = url;
                    link.click();
                    
                    document.getElementById('status').innerHTML = `
                        <div class="status-badge status-success">
                            ✔ Validated: ${currentKb.toFixed(1)} KB | Ready for upload.
                        </div>
                    `;
                }
            }, 'image/jpeg', quality);
        }
        process();
    };
});
