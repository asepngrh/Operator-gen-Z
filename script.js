/**
 * Simple Utility Receipt Generator Logic
 * Handles dynamic fields, data binding, and export functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const receiptType = document.getElementById('receipt-type');
    const paperSizeInputs = document.querySelectorAll('input[name="paper-size"]');
    const receipt = document.getElementById('receipt');
    const inputForm = document.getElementById('receipt-form');
    
    // Sidebar & Dark Mode Elements
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('input-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // View Switching Elements
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const bentoItems = document.querySelectorAll('.bento-item');
    const btnActions = document.querySelectorAll('.btn-action');

    function switchView(target) {
        // Update Nav
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.target === target);
        });

        // Update Sections
        sections.forEach(section => {
            section.classList.toggle('hidden', section.id !== `${target}-section`);
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchView(item.dataset.target);
        });
    });

    bentoItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            if (type) {
                receiptType.value = type;
                receiptType.dispatchEvent(new Event('change'));
                switchView('generator');
            }
        });
    });

    btnActions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bento-item click
            const item = btn.closest('.bento-item');
            const type = item.dataset.type;
            if (type) {
                receiptType.value = type;
                receiptType.dispatchEvent(new Event('change'));
                switchView('generator');
            }
        });
    });

    // Sidebar Toggle Logic
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('closed');
            sidebar.classList.toggle('open'); // Mobile support
        });
    }

    // Dark Mode Toggle Logic
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            try {
                localStorage.setItem('darkMode', isDark);
            } catch (e) {
                console.warn('Failed to save dark mode preference', e);
            }
        });
    }

    // Load Dark Mode Preference
    try {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    } catch (e) {
        console.warn('LocalStorage is not accessible', e);
    }

    // Initial sidebar state for mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.add('closed');
    }

    // Close sidebar on mobile when clicking outside
    window.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== menuToggle) {
            if (!sidebar.classList.contains('closed')) {
                sidebar.classList.add('closed');
            }
        }
    });

    // Dynamic Sections
    const sectionListrik = document.getElementById('section-listrik');
    const sectionAir = document.getElementById('section-air');
    const sectionWifi = document.getElementById('section-wifi');
    
    // Preview Placeholders
    const previewElements = {
        'invoice-number': document.getElementById('p-invoice-number'),
        'vendor-name': document.getElementById('p-vendor-name'),
        'date': document.getElementById('p-date'),
        'time': document.getElementById('p-time'),
        'customer-name': document.getElementById('p-customer-name'),
        'customer-id': document.getElementById('p-customer-id'),
        'total-payment': document.getElementById('p-total-payment'),
        
        // Listrik
        'listrik-type': document.getElementById('p-listrik-type'),
        'token-row': document.getElementById('p-token-row'),
        'token-val': document.getElementById('p-token-val'),
        'l-meter-start': document.getElementById('p-l-meter-start'),
        'l-meter-end': document.getElementById('p-l-meter-end'),
        'l-kwh': document.getElementById('p-l-kwh'),
        'l-tariff': document.getElementById('p-l-tariff'),
        'l-admin': document.getElementById('p-l-admin'),
        
        // Air
        'a-meter-start': document.getElementById('p-a-meter-start'),
        'a-meter-end': document.getElementById('p-a-meter-end'),
        'a-usage': document.getElementById('p-a-usage'),
        'a-fee': document.getElementById('p-a-fee'),
        'a-admin': document.getElementById('p-a-admin'),
        
        // Wifi
        'w-period': document.getElementById('p-w-period'),
        'w-plan': document.getElementById('p-w-plan'),
        'w-admin': document.getElementById('p-w-admin')
    };

    // 1. Template Switching
    if (receiptType) {
        receiptType.addEventListener('change', (e) => {
            const type = e.target.value;
            
            // Hide all
            [sectionListrik, sectionAir, sectionWifi].forEach(section => {
                if (section) section.classList.add('hidden');
            });
            
            // Hide preview sections
            ['preview-listrik', 'preview-air', 'preview-wifi'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
            
            const tipPayAir = document.getElementById('tip-pay-air');
            
            // Show selected
            if (type === 'listrik') {
                if (sectionListrik) sectionListrik.classList.remove('hidden');
                const p = document.getElementById('preview-listrik');
                if (p) p.classList.remove('hidden');
                if (tipPayAir) tipPayAir.classList.add('hidden');
            } else if (type === 'air') {
                if (sectionAir) sectionAir.classList.remove('hidden');
                const p = document.getElementById('preview-air');
                if (p) p.classList.remove('hidden');
                if (tipPayAir) tipPayAir.classList.remove('hidden');
            } else if (type === 'wifi') {
                if (sectionWifi) sectionWifi.classList.remove('hidden');
                const p = document.getElementById('preview-wifi');
                if (p) p.classList.remove('hidden');
                if (tipPayAir) tipPayAir.classList.add('hidden');
            }
            
            updatePreview();
        });
    }

    // Listrik Toggle (Prepaid/Postpaid)
    const listrikMode = document.getElementById('listrik-mode');
    const tokenGroup = document.getElementById('token-group');
    listrikMode.addEventListener('change', (e) => {
        if (e.target.value === 'prepaid') {
            tokenGroup.classList.remove('hidden');
            previewElements['token-row'].classList.remove('hidden');
            previewElements['listrik-type'].textContent = 'PRABAYAR';
        } else {
            tokenGroup.classList.add('hidden');
            previewElements['token-row'].classList.add('hidden');
            previewElements['listrik-type'].textContent = 'PASCABAYAR';
        }
    });

    // 2. Paper Size Mapping
    paperSizeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const size = e.target.value;
            receipt.className = `size-${size}`;
        });
    });

    // 3. Data Binding (Live Preview)
    inputForm.addEventListener('input', (e) => {
        const id = e.target.id;
        if (previewElements[id]) {
            let value = e.target.value;
            
            // Formatting for currency if needed
            if (id === 'total-payment' || id === 'a-fee' || id === 'a-admin' || id === 'w-admin' || id === 'l-admin') {
                value = formatCurrency(value);
            }
            
            previewElements[id].textContent = value || '-';
        }
    });

    // Invoice Number Generator
    const btnGenInvoice = document.getElementById('btn-gen-invoice');
    const invoiceInput = document.getElementById('invoice-number');

    function generateInvoiceNumber() {
        if (!invoiceInput) return;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        const invoice = `INV/${year}${month}${day}/${random}`;
        invoiceInput.value = invoice;
        invoiceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (btnGenInvoice) {
        btnGenInvoice.addEventListener('click', generateInvoiceNumber);
    }

    // Auto Calculation for Electricity Meter
    const lMeterStart = document.getElementById('l-meter-start');
    const lMeterEnd = document.getElementById('l-meter-end');
    const lKwh = document.getElementById('l-kwh');

    function calculateMeterEnd() {
        const start = parseFloat(lMeterStart.value) || 0;
        const kwh = parseFloat(lKwh.value) || 0;
        if (lMeterStart.value || lKwh.value) {
            lMeterEnd.value = parseFloat((start + kwh).toFixed(2));
            lMeterEnd.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    lMeterStart.addEventListener('input', calculateMeterEnd);
    lKwh.addEventListener('input', calculateMeterEnd);

    // Auto Calculation for Water Meter
    const aMeterStart = document.getElementById('a-meter-start');
    const aMeterEnd = document.getElementById('a-meter-end');
    const aUsage = document.getElementById('a-usage');

    function calculateAirMeterEnd() {
        const start = parseFloat(aMeterStart.value) || 0;
        const usage = parseFloat(aUsage.value) || 0;
        if (aMeterStart.value || aUsage.value) {
            aMeterEnd.value = parseFloat((start + usage).toFixed(2));
            aMeterEnd.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    aMeterStart.addEventListener('input', calculateAirMeterEnd);
    aUsage.addEventListener('input', calculateAirMeterEnd);

    // Auto Calculation for Water Usage Fee
    const aFeeInput = document.getElementById('a-fee');
    const aAdminInput = document.getElementById('a-admin');
    const totalPaymentInput = document.getElementById('total-payment');

    function calculateAirUsageFee() {
        if (receiptType.value === 'air') {
            const total = parseFloat(totalPaymentInput.value) || 0;
            const admin = parseFloat(aAdminInput.value) || 0;
            if (totalPaymentInput.value || aAdminInput.value) {
                aFeeInput.value = Math.max(0, total - admin);
                aFeeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }

    totalPaymentInput.addEventListener('input', calculateAirUsageFee);
    aAdminInput.addEventListener('input', calculateAirUsageFee);

    // Tip Modal Logic
    const tipModal = document.getElementById('tip-modal');
    const tipText = document.getElementById('tip-text');
    const closeModals = document.querySelectorAll('.close-modal, .close-modal-btn');

    function showTipModal(message) {
        tipText.textContent = message;
        tipModal.classList.remove('hidden');
    }

    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            tipModal.classList.add('hidden');
        });
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === tipModal) {
            tipModal.classList.add('hidden');
        }
    });

    document.querySelectorAll('.tip-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const tip = icon.getAttribute('data-tip');
            showTipModal(tip);
        });
    });

    function formatCurrency(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    }

    function updatePreview() {
        if (!inputForm) return;
        // Trigger manual update for all fields
        const inputs = inputForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        });
    }

    // Action Buttons
    
    // Mobile Preview Toggle
    const previewPanel = document.getElementById('preview-panel');
    const btnPreviewMobile = document.getElementById('btn-preview-mobile');
    const btnClosePreview = document.getElementById('btn-close-preview');

    if (btnPreviewMobile && previewPanel) {
        btnPreviewMobile.addEventListener('click', () => {
            previewPanel.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        });
    }

    if (btnClosePreview && previewPanel) {
        btnClosePreview.addEventListener('click', () => {
            previewPanel.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Cetak Langsung
    const btnPrint = document.getElementById('btn-print');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }

    // Download Image
    const btnDownload = document.getElementById('btn-download');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            // Simpan state asli
            if (!receipt) return;
            const originalBoxShadow = receipt.style.boxShadow;
            receipt.style.boxShadow = 'none';

            if (typeof html2canvas === 'undefined') {
                showToast('Library html2canvas belum dimuat! ⚠️');
                receipt.style.boxShadow = originalBoxShadow;
                return;
            }

            html2canvas(receipt, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true,
                logging: false,
                width: receipt.offsetWidth,
                height: receipt.offsetHeight,
                onclone: (clonedDoc) => {
                    const clonedReceipt = clonedDoc.getElementById('receipt');
                    if (clonedReceipt) {
                        clonedReceipt.style.boxShadow = 'none';
                        clonedReceipt.style.margin = '0';
                        clonedReceipt.style.position = 'relative';
                        clonedReceipt.style.display = 'block';
                    }
                }
            }).then(canvas => {
                receipt.style.boxShadow = originalBoxShadow;
                const link = document.createElement('a');
                link.download = `receipt-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            }).catch(err => {
                console.error("Gagal mendownload gambar:", err);
                receipt.style.boxShadow = originalBoxShadow;
                showToast('Gagal memproses gambar! ❌');
            });
        });
    }

    // Ekspor PDF
    const btnPdf = document.getElementById('btn-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', () => {
            if (!receipt) return;
            
            const sizeInput = document.querySelector('input[name="paper-size"]:checked');
            if (!sizeInput) return;
            
            const size = sizeInput.value;

            if (typeof html2pdf === 'undefined') {
                showToast('Library html2pdf belum dimuat! ⚠️');
                return;
            }

            const opt = {
                margin: 0,
                filename: `receipt-${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { 
                    scale: 3, 
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    width: receipt.offsetWidth,
                    height: receipt.offsetHeight,
                    onclone: (clonedDoc) => {
                        const clonedReceipt = clonedDoc.getElementById('receipt');
                        if (clonedReceipt) {
                            clonedReceipt.style.boxShadow = 'none';
                            clonedReceipt.style.margin = '0';
                            clonedReceipt.style.display = 'block';
                        }
                    }
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: getPdfFormat(), 
                    orientation: 'portrait',
                    compress: true
                }
            };
            
            // Temporary style for export
            const originalBoxShadow = receipt.style.boxShadow;
            receipt.style.boxShadow = 'none';
            
            html2pdf().set(opt).from(receipt).save().then(() => {
                receipt.style.boxShadow = originalBoxShadow;
            }).catch(err => {
                console.error("Gagal mendownload PDF:", err);
                receipt.style.boxShadow = originalBoxShadow;
                showToast('Gagal memproses PDF! ❌');
            });
        });
    }

    function getPdfFormat() {
        const size = document.querySelector('input[name="paper-size"]:checked').value;
        if (size === 'thermal-58') return [58, 200];
        if (size === 'thermal-80') return [80, 250];
        return [58, 200];
    }

    // Reset Form
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (inputForm) inputForm.reset();
            if (receiptType) receiptType.dispatchEvent(new Event('change'));
            updatePreview();
            showToast('Formulir telah direset! ✨');
        });
    }

    function showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Initial setup
    generateInvoiceNumber();
    receiptType.dispatchEvent(new Event('change'));
    updatePreview();
});
