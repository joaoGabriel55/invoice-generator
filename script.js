// LocalStorage key
const STORAGE_KEY = 'invoiceGeneratorData';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Try to load saved data first
    loadFormData();

    // If no saved dates, set default dates
    if (!document.getElementById('creationDate').value) {
        const today = new Date();
        document.getElementById('creationDate').valueAsDate = today;
    }

    if (!document.getElementById('dueDate').value) {
        const today = new Date();
        const twoDaysLater = new Date(today);
        twoDaysLater.setDate(twoDaysLater.getDate() + 2);
        document.getElementById('dueDate').valueAsDate = twoDaysLater;
    }

    // Update preview on page load
    updatePreview();

    // Add event listeners for real-time updates and saving
    document.getElementById('invoiceNumber').addEventListener('input', function() {
        updatePreview();
        saveFormData();
    });

    document.getElementById('creationDate').addEventListener('change', function() {
        updatePreview();
        saveFormData();
    });

    document.getElementById('dueDate').addEventListener('change', function() {
        updatePreview();
        saveFormData();
    });

    // Add event listeners for Bill From fields
    const billFromFields = ['billFromName', 'billFromAddress1', 'billFromAddress2', 'billFromZip'];
    billFromFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', function() {
            updatePreview();
            saveFormData();
        });
    });

    // Add event listeners for Bill To fields
    const billToFields = ['billToName', 'billToAddress1', 'billToAddress2'];
    billToFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', function() {
            updatePreview();
            saveFormData();
        });
    });

    // Add event listeners for Bank Details fields
    const bankFields = ['beneficiaryName', 'beneficiaryAccount', 'swiftCode', 'bankName', 'bankAddress', 'intermediarySwift', 'intermediaryBankName'];
    bankFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('input', function() {
            updatePreview();
            saveFormData();
        });
    });

    // Add event listeners for line items
    const lineItems = document.getElementById('lineItems');
    lineItems.addEventListener('input', function(e) {
        if (e.target.classList.contains('item-description') || e.target.classList.contains('item-amount')) {
            updatePreview();
            saveFormData();
        }
    });
});

// Save form data to localStorage
function saveFormData() {
    const data = {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        creationDate: document.getElementById('creationDate').value,
        dueDate: document.getElementById('dueDate').value,
        // Bill From fields
        billFromName: document.getElementById('billFromName').value,
        billFromAddress1: document.getElementById('billFromAddress1').value,
        billFromAddress2: document.getElementById('billFromAddress2').value,
        billFromZip: document.getElementById('billFromZip').value,
        // Bill To fields
        billToName: document.getElementById('billToName').value,
        billToAddress1: document.getElementById('billToAddress1').value,
        billToAddress2: document.getElementById('billToAddress2').value,
        // Bank Details fields
        beneficiaryName: document.getElementById('beneficiaryName').value,
        beneficiaryAccount: document.getElementById('beneficiaryAccount').value,
        swiftCode: document.getElementById('swiftCode').value,
        bankName: document.getElementById('bankName').value,
        bankAddress: document.getElementById('bankAddress').value,
        intermediarySwift: document.getElementById('intermediarySwift').value,
        intermediaryBankName: document.getElementById('intermediaryBankName').value,
        lineItems: []
    };

    // Collect all line items
    const lineItems = document.querySelectorAll('.line-item');
    lineItems.forEach(item => {
        const description = item.querySelector('.item-description').value;
        const amount = item.querySelector('.item-amount').value;
        data.lineItems.push({ description, amount });
    });

    // Save to localStorage
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('Form data saved to localStorage');

        // Show visual feedback
        showSaveStatus(i18n.t('form.saved'), '#28a745');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showSaveStatus(i18n.t('form.saveFailed'), '#dc3545');
    }
}

// Show save status feedback
function showSaveStatus(message, color) {
    const statusElement = document.getElementById('autoSaveStatus');
    if (statusElement) {
        const originalText = statusElement.textContent;
        statusElement.textContent = message;
        statusElement.style.color = color;

        // Reset after 2 seconds
        setTimeout(() => {
            statusElement.textContent = i18n.t('form.autoSaveEnabled');
            statusElement.style.color = '#6c757d';
        }, 2000);
    }
}

// Load form data from localStorage
function loadFormData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            console.log('No saved data found');
            return;
        }

        const data = JSON.parse(savedData);

        // Restore basic fields
        if (data.invoiceNumber) {
            document.getElementById('invoiceNumber').value = data.invoiceNumber;
        }

        if (data.creationDate) {
            document.getElementById('creationDate').value = data.creationDate;
        }

        if (data.dueDate) {
            document.getElementById('dueDate').value = data.dueDate;
        }

        // Restore Bill From fields
        if (data.billFromName) {
            document.getElementById('billFromName').value = data.billFromName;
        }
        if (data.billFromAddress1) {
            document.getElementById('billFromAddress1').value = data.billFromAddress1;
        }
        if (data.billFromAddress2) {
            document.getElementById('billFromAddress2').value = data.billFromAddress2;
        }
        if (data.billFromZip) {
            document.getElementById('billFromZip').value = data.billFromZip;
        }

        // Restore Bill To fields
        if (data.billToName) {
            document.getElementById('billToName').value = data.billToName;
        }
        if (data.billToAddress1) {
            document.getElementById('billToAddress1').value = data.billToAddress1;
        }
        if (data.billToAddress2) {
            document.getElementById('billToAddress2').value = data.billToAddress2;
        }

        // Restore Bank Details fields
        if (data.beneficiaryName) {
            document.getElementById('beneficiaryName').value = data.beneficiaryName;
        }
        if (data.beneficiaryAccount) {
            document.getElementById('beneficiaryAccount').value = data.beneficiaryAccount;
        }
        if (data.swiftCode) {
            document.getElementById('swiftCode').value = data.swiftCode;
        }
        if (data.bankName) {
            document.getElementById('bankName').value = data.bankName;
        }
        if (data.bankAddress) {
            document.getElementById('bankAddress').value = data.bankAddress;
        }
        if (data.intermediarySwift) {
            document.getElementById('intermediarySwift').value = data.intermediarySwift;
        }
        if (data.intermediaryBankName) {
            document.getElementById('intermediaryBankName').value = data.intermediaryBankName;
        }

        // Restore line items
        if (data.lineItems && data.lineItems.length > 0) {
            const lineItemsContainer = document.getElementById('lineItems');
            lineItemsContainer.innerHTML = ''; // Clear existing items

            data.lineItems.forEach(item => {
                const newItem = document.createElement('div');
                newItem.className = 'line-item';
                newItem.innerHTML = `
                    <div class="line-item-row">
                        <input type="text" class="item-description" data-i18n-placeholder="form.placeholderDescription" placeholder="${i18n.t('form.placeholderDescription')}" value="${item.description || ''}">
                        <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t('form.placeholderAmount')}" step="0.01" min="0" value="${item.amount || '0'}">
                        <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
                    </div>
                `;
                lineItemsContainer.appendChild(newItem);
            });
        }

        console.log('Form data loaded from localStorage');
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

// Clear saved form data
function clearSavedData() {
    if (confirm(i18n.t('alerts.confirmClear'))) {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Saved data cleared');

            // Reset form to defaults
            document.getElementById('invoiceNumber').value = '1';

            const today = new Date();
            const twoDaysLater = new Date(today);
            twoDaysLater.setDate(twoDaysLater.getDate() + 2);

            document.getElementById('creationDate').valueAsDate = today;
            document.getElementById('dueDate').valueAsDate = twoDaysLater;

            // Reset Bill From fields
            document.getElementById('billFromName').value = 'John Doe';
            document.getElementById('billFromAddress1').value = '123 Main Street, Suite 100';
            document.getElementById('billFromAddress2').value = 'New York, NY, USA';
            document.getElementById('billFromZip').value = '10001';

            // Reset Bill To fields
            document.getElementById('billToName').value = 'Acme Corporation';
            document.getElementById('billToAddress1').value = '456 Business Ave';
            document.getElementById('billToAddress2').value = 'Los Angeles, CA 90001, USA';

            // Reset Bank Details fields
            document.getElementById('beneficiaryName').value = 'John Doe';
            document.getElementById('beneficiaryAccount').value = 'US00 1234 5678 9012 3456 78';
            document.getElementById('swiftCode').value = 'BANKUS33XXX';
            document.getElementById('bankName').value = 'First National Bank';
            document.getElementById('bankAddress').value = '789 Financial Plaza, New York, NY 10005';
            document.getElementById('intermediarySwift').value = 'CHASUS33XXX';
            document.getElementById('intermediaryBankName').value = 'Global Transfer Bank, N.A';

            // Reset line items to default
            const lineItemsContainer = document.getElementById('lineItems');
            lineItemsContainer.innerHTML = `
                <div class="line-item">
                    <div class="line-item-row">
                        <input type="text" class="item-description" data-i18n-placeholder="form.placeholderDescription" placeholder="${i18n.t('form.placeholderDescription')}" value="Consulting Services">
                        <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t('form.placeholderAmount')}" step="0.01" min="0" value="1500">
                        <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
                    </div>
                </div>
                <div class="line-item">
                    <div class="line-item-row">
                        <input type="text" class="item-description" data-i18n-placeholder="form.placeholderAdditional" placeholder="${i18n.t('form.placeholderAdditional')}" value="Design Work">
                        <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t('form.placeholderAmount')}" step="0.01" min="0" value="750">
                        <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
                    </div>
                </div>
                <div class="line-item">
                    <div class="line-item-row">
                        <input type="text" class="item-description" data-i18n-placeholder="form.placeholderReimbursement" placeholder="${i18n.t('form.placeholderReimbursement')}" value="Travel Expenses">
                        <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t('form.placeholderAmount')}" step="0.01" min="0" value="250">
                        <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
                    </div>
                </div>
            `;

            updatePreview();
            alert(i18n.t('alerts.dataCleared'));
        } catch (error) {
            console.error('Error clearing saved data:', error);
            alert(i18n.t('alerts.dataCleared'));
        }
    }
}

// Add a new line item
function addLineItem() {
    const lineItems = document.getElementById('lineItems');
    
    const newItem = document.createElement('div');
    newItem.className = 'line-item';
    newItem.innerHTML = `
        <div class="line-item-row">
            <input type="text" class="item-description" data-i18n-placeholder="form.placeholderDescription" placeholder="${i18n.t('form.placeholderDescription')}" />
            <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t('form.placeholderAmount')}" step="0.01" min="0" />
            <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
        </div>
    `;

    lineItems.appendChild(newItem);
    updatePreview();
    saveFormData();
}

// Remove a line item
function removeLineItem(button) {
    const lineItems = document.getElementById('lineItems');
    const lineItemsCount = lineItems.querySelectorAll('.line-item').length;

    // Keep at least one line item
    if (lineItemsCount > 1) {
        button.closest('.line-item').remove();
        updatePreview();
        saveFormData();
    } else {
        alert(i18n.t('alerts.minOneLineItem'));
    }
}

// Update the invoice preview
function updatePreview() {
    // Update invoice number
    const invoiceNumber = document.getElementById('invoiceNumber').value || '1';
    document.getElementById('previewInvoiceNumber').textContent = invoiceNumber;

    // Update dates
    const creationDate = document.getElementById('creationDate').value;
    const dueDate = document.getElementById('dueDate').value;

    document.getElementById('previewCreationDate').textContent =
        creationDate ? formatDate(creationDate) : '-';
    document.getElementById('previewDueDate').textContent =
        dueDate ? formatDate(dueDate) : '-';

    // Update Bill From information
    document.getElementById('previewBillFromName').textContent = 
        document.getElementById('billFromName').value || 'N/A';
    document.getElementById('previewBillFromAddress1').textContent = 
        document.getElementById('billFromAddress1').value || '';
    document.getElementById('previewBillFromAddress2').textContent = 
        document.getElementById('billFromAddress2').value || '';
    const zipCode = document.getElementById('billFromZip').value;
    document.getElementById('previewBillFromZip').textContent = 
        zipCode ? `${i18n.t('preview.zipCodeLabel')} ${zipCode}` : '';

    // Update Bill To information
    document.getElementById('previewBillToName').textContent = 
        document.getElementById('billToName').value || 'N/A';
    document.getElementById('previewBillToAddress1').textContent = 
        document.getElementById('billToAddress1').value || '';
    document.getElementById('previewBillToAddress2').textContent = 
        document.getElementById('billToAddress2').value || '';

    // Update Bank Details
    document.getElementById('previewBeneficiaryName').textContent = 
        document.getElementById('beneficiaryName').value || 'N/A';
    document.getElementById('previewBeneficiaryAccount').textContent = 
        document.getElementById('beneficiaryAccount').value || 'N/A';
    document.getElementById('previewSwiftCode').textContent = 
        document.getElementById('swiftCode').value || 'N/A';
    document.getElementById('previewBankName').textContent = 
        document.getElementById('bankName').value || 'N/A';
    document.getElementById('previewBankAddress').textContent = 
        document.getElementById('bankAddress').value || 'N/A';

    // Update Intermediary Bank Details
    document.getElementById('previewIntermediarySwift').textContent = 
        document.getElementById('intermediarySwift').value || 'N/A';
    document.getElementById('previewIntermediaryBankName').textContent = 
        document.getElementById('intermediaryBankName').value || 'N/A';

    // Update line items
    const lineItems = document.querySelectorAll('.line-item');
    const previewBody = document.getElementById('previewLineItems');
    previewBody.innerHTML = '';

    let total = 0;
    let hasItems = false;

    lineItems.forEach(item => {
        const description = item.querySelector('.item-description').value.trim();
        const amount = parseFloat(item.querySelector('.item-amount').value) || 0;

        if (description || amount > 0) {
            hasItems = true;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${description || i18n.t('preview.noItems')}</td>
                <td class="text-right">${i18n.formatCurrency(amount)}</td>
            `;
            previewBody.appendChild(row);
            total += amount;
        }
    });

    // If no items, show placeholder
    if (!hasItems) {
        previewBody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">${i18n.t('preview.noItems')}</td></tr>`;
    }

    // Update total
    document.getElementById('previewTotal').textContent = i18n.formatCurrency(total);
}

// Format date to YYYY-MM-DD
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate() + 1).padStart(2, '0'); // Add 1 to fix date offset
    return `${year}-${month}-${day}`;
}

// Generate PDF
function generatePDF(event) {
    // Validate that we have required data
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const creationDate = document.getElementById('creationDate').value;
    const dueDate = document.getElementById('dueDate').value;

    if (!invoiceNumber) {
        alert(i18n.t('alerts.noInvoiceNumber'));
        return;
    }
    if (!creationDate) {
        alert(i18n.t('alerts.noCreationDate'));
        return;
    }
    if (!dueDate) {
        alert(i18n.t('alerts.noDueDate'));
        return;
    }

    // Check if we have at least one item with description
    const lineItems = document.querySelectorAll('.line-item');
    let hasValidItem = false;

    lineItems.forEach(item => {
        const description = item.querySelector('.item-description').value.trim();
        if (description) {
            hasValidItem = true;
        }
    });

    if (!hasValidItem) {
        alert(i18n.t('alerts.noLineItems'));
        return;
    }

    // Update preview one more time to ensure it's current
    updatePreview();

    // Get the invoice content
    const element = document.querySelector('.invoice-content');

    // Configure PDF options
    const opt = {
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: `invoice_${invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
            windowHeight: element.scrollHeight
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { 
            mode: 'css',
            avoid: ['tr', '.party', '.date-item', '.bank-details', '.invoice-header']
        }
    };

    // Show loading indicator (optional - you can add a loading spinner here)
    const btn = event ? event.target : document.querySelector('.btn-success[onclick="generatePDF()"]');
    const originalText = btn.textContent;
    btn.textContent = i18n.t('form.exporting');
    btn.disabled = true;

    // Generate PDF
    html2pdf().set(opt).from(element).save().then(function() {
        btn.textContent = originalText;
        btn.disabled = false;
        console.log('PDF generated successfully');
    }).catch(function(error) {
        btn.textContent = originalText;
        btn.disabled = false;
        console.error('Error generating PDF:', error);
        alert('An error occurred while generating the PDF. Please try again.');
    });
}

// Helper function to format currency
function formatCurrency(amount) {
    return i18n.formatCurrency(amount);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + P to generate PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        generatePDF();
    }

    // Ctrl/Cmd + Enter to update preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        updatePreview();
    }
});
