var container        = document.getElementById('container'),
    cache_width = container.style.width,
    a4          = [595.28, 841.89];
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('export-pdf').addEventListener('click', exportPDF);
});

function exportPDF () {
    document.getElementById('export-pdf').setAttribute('disabled', 'disabled');
    window.scrollTo(0, 0);
    getCanvas().then(function (canvas) {
        getCanvas().then(function (canvas) {
            var
            img = canvas.toDataURL("image/png"),
            doc = new jsPDF({
                    unit: 'px',
                    format: 'a4'
                });
            //var dl = document.getElementById('dl-image');
            //dl.href = canvas.toDataURL("image/octet-stream");
            //dl.click();

            ['refaire-signature', 'reset', 'sauvegarder', 'export-pdf'].forEach(function(e) {
                document.getElementById(e).classList.remove('hidden');
            });

            doc.addImage(img, 'JPEG', 0, 0);
            doc.save('attestation-de-deplacement-derogatoire.pdf');
            container.style.width = cache_width;
            document.getElementById('export-pdf').removeAttribute('disabled');
        });
    });
}
function getCanvas() {
    container.style.width = (a4[0] * 1.33333) - 80;
    container.style.maxWidth = 'none';
    ['refaire-signature', 'reset', 'sauvegarder', 'export-pdf'].forEach(function(e) {
        document.getElementById(e).classList.add('hidden');
    });
    return html2canvas(container, {
        backgroundColor: '#ffffff',
        imageTimeout: 2000,
        removeContainer: true
    });
}
