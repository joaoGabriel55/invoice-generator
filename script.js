// LocalStorage key
const STORAGE_KEY = "invoiceGeneratorData";

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  // Try to load saved data first
  loadFormData();

  // Set default currency based on locale if no saved data exists
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) {
    // Wait a bit for i18n to initialize, then set default currency
    setTimeout(() => {
      const currencySelect = document.getElementById("currency");
      if (currencySelect && typeof i18n !== "undefined") {
        const defaultCurrency = i18n.t("currency");
        if (
          currencySelect.querySelector(`option[value="${defaultCurrency}"]`)
        ) {
          currencySelect.value = defaultCurrency;
        }
      }
    }, 100);
  }

  // If no saved dates, set default dates
  if (!document.getElementById("creationDate").value) {
    const today = new Date();
    document.getElementById("creationDate").valueAsDate = today;
  }

  if (!document.getElementById("dueDate").value) {
    const today = new Date();
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    document.getElementById("dueDate").valueAsDate = twoDaysLater;
  }

  // Update preview on page load
  updatePreview();

  // Add event listeners for real-time updates and saving
  document
    .getElementById("invoiceNumber")
    .addEventListener("input", function () {
      updatePreview();
      saveFormData();
    });

  document.getElementById("currency").addEventListener("change", function () {
    updatePreview();
    saveFormData();
  });

  document
    .getElementById("creationDate")
    .addEventListener("change", function () {
      updatePreview();
      saveFormData();
    });

  document.getElementById("dueDate").addEventListener("change", function () {
    updatePreview();
    saveFormData();
  });

  // Add event listeners for Bill From fields
  const billFromFields = [
    "billFromName",
    "billFromAddress1",
    "billFromAddress2",
    "billFromZip",
  ];
  billFromFields.forEach((fieldId) => {
    document.getElementById(fieldId).addEventListener("input", function () {
      updatePreview();
      saveFormData();
    });
  });

  // Add event listeners for Bill To fields
  const billToFields = ["billToName", "billToAddress1", "billToAddress2"];
  billToFields.forEach((fieldId) => {
    document.getElementById(fieldId).addEventListener("input", function () {
      updatePreview();
      saveFormData();
    });
  });

  // Add event listeners for dynamic bank detail fields
  const bankDetailFields = document.getElementById("bankDetailFields");
  bankDetailFields.addEventListener("input", function (e) {
    if (
      e.target.classList.contains("bank-field-label") ||
      e.target.classList.contains("bank-field-value")
    ) {
      updatePreview();
      saveFormData();
    }
  });

  // Add event listeners for line items
  const lineItems = document.getElementById("lineItems");
  lineItems.addEventListener("input", function (e) {
    if (
      e.target.classList.contains("item-description") ||
      e.target.classList.contains("item-amount")
    ) {
      updatePreview();
      saveFormData();
    }
  });
});

// Save form data to localStorage
function saveFormData() {
  const data = {
    invoiceNumber: document.getElementById("invoiceNumber").value,
    currency: document.getElementById("currency").value,
    creationDate: document.getElementById("creationDate").value,
    dueDate: document.getElementById("dueDate").value,
    // Bill From fields
    billFromName: document.getElementById("billFromName").value,
    billFromAddress1: document.getElementById("billFromAddress1").value,
    billFromAddress2: document.getElementById("billFromAddress2").value,
    billFromZip: document.getElementById("billFromZip").value,
    // Bill To fields
    billToName: document.getElementById("billToName").value,
    billToAddress1: document.getElementById("billToAddress1").value,
    billToAddress2: document.getElementById("billToAddress2").value,
    // Dynamic bank detail fields
    bankFields: [],
    lineItems: [],
  };

  // Collect all bank detail fields
  const bankFieldRows = document.querySelectorAll(".bank-field-row");
  bankFieldRows.forEach((row) => {
    const label = row.querySelector(".bank-field-label").value;
    const value = row.querySelector(".bank-field-value").value;
    data.bankFields.push({ label, value });
  });

  // Collect all line items
  const lineItems = document.querySelectorAll(".line-item");
  lineItems.forEach((item) => {
    const description = item.querySelector(".item-description").value;
    const amount = item.querySelector(".item-amount").value;
    data.lineItems.push({ description, amount });
  });

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("Form data saved to localStorage");

    // Show visual feedback
    showSaveStatus(i18n.t("form.saved"), "#28a745");
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    showSaveStatus(i18n.t("form.saveFailed"), "#dc3545");
  }
}

// Show save status feedback
function showSaveStatus(message, color) {
  const statusElement = document.getElementById("autoSaveStatus");
  if (statusElement) {
    const originalText = statusElement.textContent;
    statusElement.textContent = message;
    statusElement.style.color = color;

    // Reset after 2 seconds
    setTimeout(() => {
      statusElement.textContent = i18n.t("form.autoSaveEnabled");
      statusElement.style.color = "#6c757d";
    }, 2000);
  }
}

// Load form data from localStorage
function loadFormData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      console.log("No saved data found");
      return;
    }

    const data = JSON.parse(savedData);

    // Restore basic fields
    if (data.invoiceNumber) {
      document.getElementById("invoiceNumber").value = data.invoiceNumber;
    }

    if (data.currency) {
      document.getElementById("currency").value = data.currency;
    }

    if (data.creationDate) {
      document.getElementById("creationDate").value = data.creationDate;
    }

    if (data.dueDate) {
      document.getElementById("dueDate").value = data.dueDate;
    }

    // Restore Bill From fields
    if (data.billFromName) {
      document.getElementById("billFromName").value = data.billFromName;
    }
    if (data.billFromAddress1) {
      document.getElementById("billFromAddress1").value = data.billFromAddress1;
    }
    if (data.billFromAddress2) {
      document.getElementById("billFromAddress2").value = data.billFromAddress2;
    }
    if (data.billFromZip) {
      document.getElementById("billFromZip").value = data.billFromZip;
    }

    // Restore Bill To fields
    if (data.billToName) {
      document.getElementById("billToName").value = data.billToName;
    }
    if (data.billToAddress1) {
      document.getElementById("billToAddress1").value = data.billToAddress1;
    }
    if (data.billToAddress2) {
      document.getElementById("billToAddress2").value = data.billToAddress2;
    }

    // Migrate old bank detail format to new dynamic format
    if (!data.bankFields && data.beneficiaryName) {
      data.bankFields = [];
      if (data.beneficiaryName) data.bankFields.push({ label: "Beneficiary Name", value: data.beneficiaryName });
      if (data.beneficiaryAccount) data.bankFields.push({ label: "Account Number (IBAN)", value: data.beneficiaryAccount });
      if (data.swiftCode) data.bankFields.push({ label: "SWIFT Code", value: data.swiftCode });
      if (data.bankName) data.bankFields.push({ label: "Bank Name", value: data.bankName });
      if (data.bankAddress) data.bankFields.push({ label: "Bank Address", value: data.bankAddress });
      if (data.intermediarySwift) data.bankFields.push({ label: "Intermediary SWIFT/BIC", value: data.intermediarySwift });
      if (data.intermediaryBankName) data.bankFields.push({ label: "Intermediary Bank", value: data.intermediaryBankName });
    }

    // Restore dynamic bank detail fields
    if (data.bankFields && data.bankFields.length > 0) {
      const bankContainer = document.getElementById("bankDetailFields");
      bankContainer.innerHTML = "";
      data.bankFields.forEach((field) => {
        const row = document.createElement("div");
        row.className = "bank-field-row";
        row.innerHTML = `
          <input type="text" class="bank-field-label" data-i18n-placeholder="form.fieldLabel" placeholder="${i18n.t("form.fieldLabel")}" value="${escapeHtml(field.label || "")}" />
          <input type="text" class="bank-field-value" data-i18n-placeholder="form.fieldValue" placeholder="${i18n.t("form.fieldValue")}" value="${escapeHtml(field.value || "")}" />
          <button type="button" class="btn-remove" onclick="removeBankField(this)">✕</button>
        `;
        bankContainer.appendChild(row);
      });
    }

    // Restore line items
    if (data.lineItems && data.lineItems.length > 0) {
      const lineItemsContainer = document.getElementById("lineItems");
      lineItemsContainer.innerHTML = ""; // Clear existing items

      data.lineItems.forEach((item) => {
        const newItem = document.createElement("div");
        newItem.className = "line-item";
        newItem.innerHTML = `
                    <div class="line-item-row">
                        <input type="text" class="item-description" data-i18n-placeholder="form.placeholderDescription" placeholder="${i18n.t("form.placeholderDescription")}" value="${item.description || ""}">
                        <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t("form.placeholderAmount")}" step="0.01" min="0" value="${item.amount || "0"}">
                        <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
                    </div>
                `;
        lineItemsContainer.appendChild(newItem);
      });
    }

    console.log("Form data loaded from localStorage");
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
}

// Clear saved form data
function clearSavedData() {
  if (confirm(i18n.t("alerts.confirmClear"))) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("Saved data cleared");

      // Reset form to defaults
      document.getElementById("invoiceNumber").value = "1";

      const today = new Date();
      const twoDaysLater = new Date(today);
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);

      document.getElementById("creationDate").valueAsDate = today;
      document.getElementById("dueDate").valueAsDate = twoDaysLater;

      // Reset Bill From fields
      document.getElementById("billFromName").value = "John Doe";
      document.getElementById("billFromAddress1").value =
        "123 Main Street, Suite 100";
      document.getElementById("billFromAddress2").value = "New York, NY, USA";
      document.getElementById("billFromZip").value = "10001";

      // Reset Bill To fields
      document.getElementById("billToName").value = "Acme Corporation";
      document.getElementById("billToAddress1").value = "456 Business Ave";
      document.getElementById("billToAddress2").value =
        "Los Angeles, CA 90001, USA";

      // Reset bank detail fields to defaults
      const bankContainer = document.getElementById("bankDetailFields");
      bankContainer.innerHTML = `
        <div class="bank-field-row">
          <input type="text" class="bank-field-label" data-i18n-placeholder="form.fieldLabel" placeholder="${i18n.t("form.fieldLabel")}" value="Beneficiary Name" />
          <input type="text" class="bank-field-value" data-i18n-placeholder="form.fieldValue" placeholder="${i18n.t("form.fieldValue")}" value="John Doe" />
          <button type="button" class="btn-remove" onclick="removeBankField(this)">✕</button>
        </div>
        <div class="bank-field-row">
          <input type="text" class="bank-field-label" data-i18n-placeholder="form.fieldLabel" placeholder="${i18n.t("form.fieldLabel")}" value="Account Number (IBAN)" />
          <input type="text" class="bank-field-value" data-i18n-placeholder="form.fieldValue" placeholder="${i18n.t("form.fieldValue")}" value="US00 1234 5678 9012 3456 78" />
          <button type="button" class="btn-remove" onclick="removeBankField(this)">✕</button>
        </div>
        <div class="bank-field-row">
          <input type="text" class="bank-field-label" data-i18n-placeholder="form.fieldLabel" placeholder="${i18n.t("form.fieldLabel")}" value="SWIFT Code" />
          <input type="text" class="bank-field-value" data-i18n-placeholder="form.fieldValue" placeholder="${i18n.t("form.fieldValue")}" value="BANKUS33XXX" />
          <button type="button" class="btn-remove" onclick="removeBankField(this)">✕</button>
        </div>
        <div class="bank-field-row">
          <input type="text" class="bank-field-label" data-i18n-placeholder="form.fieldLabel" placeholder="${i18n.t("form.fieldLabel")}" value="Bank Name" />
          <input type="text" class="bank-field-value" data-i18n-placeholder="form.fieldValue" placeholder="${i18n.t("form.fieldValue")}" value="First National Bank" />
          <button type="button" class="btn-remove" onclick="removeBankField(this)">✕</button>
        </div>
        <div class="bank-field-row">
          <input type="text" class="bank-field-label" data-i18n-placeholder="form.fieldLabel" placeholder="${i18n.t("form.fieldLabel")}" value="Bank Address" />
          <input type="text" class="bank-field-value" data-i18n-placeholder="form.fieldValue" placeholder="${i18n.t("form.fieldValue")}" value="789 Financial Plaza, New York, NY 10005" />
          <button type="button" class="btn-remove" onclick="removeBankField(this)">✕</button>
        </div>
      `;

      // Reset line items to default
      const lineItemsContainer = document.getElementById("lineItems");
      lineItemsContainer.innerHTML = `
                <div class="line-item">
                    <div class="line-item-row">
                        <input type="text" class="item-description" data-i18n-placeholder="form.placeholderDescription" placeholder="${i18n.t("form.placeholderDescription")}" value="Consulting Services">
                        <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t("form.placeholderAmount")}" step="0.01" min="0" value="1500">
                        <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
                    </div>
                </div>
                <div class="line-item">
                    <div class="line-item-row">
                        <input type="text" class="item-description" data-i18n-placeholder="form.placeholderAdditional" placeholder="${i18n.t("form.placeholderAdditional")}" value="Design Work">
                        <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t("form.placeholderAmount")}" step="0.01" min="0" value="750">
                        <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
                    </div>
                </div>
                <div class="line-item">
                    <div class="line-item-row">
                        <input type="text" class="item-description" data-i18n-placeholder="form.placeholderReimbursement" placeholder="${i18n.t("form.placeholderReimbursement")}" value="Travel Expenses">
                        <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t("form.placeholderAmount")}" step="0.01" min="0" value="250">
                        <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
                    </div>
                </div>
            `;

      updatePreview();
      alert(i18n.t("alerts.dataCleared"));
    } catch (error) {
      console.error("Error clearing saved data:", error);
      alert(i18n.t("alerts.dataCleared"));
    }
  }
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// Add a new bank detail field
function addBankField() {
  const container = document.getElementById("bankDetailFields");
  const row = document.createElement("div");
  row.className = "bank-field-row";
  row.innerHTML = `
    <input type="text" class="bank-field-label" data-i18n-placeholder="form.fieldLabel" placeholder="${i18n.t("form.fieldLabel")}" />
    <input type="text" class="bank-field-value" data-i18n-placeholder="form.fieldValue" placeholder="${i18n.t("form.fieldValue")}" />
    <button type="button" class="btn-remove" onclick="removeBankField(this)">✕</button>
  `;
  container.appendChild(row);
  updatePreview();
  saveFormData();
}

// Remove a bank detail field
function removeBankField(button) {
  const container = document.getElementById("bankDetailFields");
  const rows = container.querySelectorAll(".bank-field-row");
  if (rows.length > 1) {
    button.closest(".bank-field-row").remove();
    updatePreview();
    saveFormData();
  } else {
    alert(i18n.t("alerts.minOneBankField"));
  }
}

// Add a new line item
function addLineItem() {
  const lineItems = document.getElementById("lineItems");

  const newItem = document.createElement("div");
  newItem.className = "line-item";
  newItem.innerHTML = `
        <div class="line-item-row">
            <input type="text" class="item-description" data-i18n-placeholder="form.placeholderDescription" placeholder="${i18n.t("form.placeholderDescription")}" />
            <input type="number" class="item-amount" data-i18n-placeholder="form.placeholderAmount" placeholder="${i18n.t("form.placeholderAmount")}" step="0.01" min="0" />
            <button type="button" class="btn-remove" onclick="removeLineItem(this)">✕</button>
        </div>
    `;

  lineItems.appendChild(newItem);
  updatePreview();
  saveFormData();
}

// Remove a line item
function removeLineItem(button) {
  const lineItems = document.getElementById("lineItems");
  const lineItemsCount = lineItems.querySelectorAll(".line-item").length;

  // Keep at least one line item
  if (lineItemsCount > 1) {
    button.closest(".line-item").remove();
    updatePreview();
    saveFormData();
  } else {
    alert(i18n.t("alerts.minOneLineItem"));
  }
}

// Update the invoice preview
function updatePreview() {
  // Update invoice number
  const invoiceNumber = document.getElementById("invoiceNumber").value || "1";
  document.getElementById("previewInvoiceNumber").textContent = invoiceNumber;

  // Update dates
  const creationDate = document.getElementById("creationDate").value;
  const dueDate = document.getElementById("dueDate").value;

  document.getElementById("previewCreationDate").textContent = creationDate
    ? formatDate(creationDate)
    : "-";
  document.getElementById("previewDueDate").textContent = dueDate
    ? formatDate(dueDate)
    : "-";

  // Update Bill From information
  document.getElementById("previewBillFromName").textContent =
    document.getElementById("billFromName").value || "N/A";
  document.getElementById("previewBillFromAddress1").textContent =
    document.getElementById("billFromAddress1").value || "";
  document.getElementById("previewBillFromAddress2").textContent =
    document.getElementById("billFromAddress2").value || "";
  document.getElementById("previewBillFromZip").textContent =
    document.getElementById("billFromZip").value || "";

  // Update Bill To information
  document.getElementById("previewBillToName").textContent =
    document.getElementById("billToName").value || "N/A";
  document.getElementById("previewBillToAddress1").textContent =
    document.getElementById("billToAddress1").value || "";
  document.getElementById("previewBillToAddress2").textContent =
    document.getElementById("billToAddress2").value || "";

  // Update dynamic bank details preview
  const previewBankDetails = document.getElementById("previewBankDetails");
  previewBankDetails.innerHTML = "";
  const bankFieldRows = document.querySelectorAll(".bank-field-row");
  bankFieldRows.forEach((row) => {
    const label = row.querySelector(".bank-field-label").value.trim();
    const value = row.querySelector(".bank-field-value").value.trim();
    if (label || value) {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${escapeHtml(label || "—")}:</strong> ${escapeHtml(value || "N/A")}`;
      previewBankDetails.appendChild(p);
    }
  });

  // Update line items
  const lineItems = document.querySelectorAll(".line-item");
  const previewBody = document.getElementById("previewLineItems");
  previewBody.innerHTML = "";

  let total = 0;
  let hasItems = false;

  lineItems.forEach((item) => {
    const description = item.querySelector(".item-description").value.trim();
    const amount = parseFloat(item.querySelector(".item-amount").value) || 0;

    if (description || amount > 0) {
      hasItems = true;
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${description || i18n.t("preview.noItems")}</td>
                <td class="text-right">${i18n.formatCurrency(amount)}</td>
            `;
      previewBody.appendChild(row);
      total += amount;
    }
  });

  // If no items, show placeholder
  if (!hasItems) {
    previewBody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">${i18n.t("preview.noItems")}</td></tr>`;
  }

  // Update total
  document.getElementById("previewTotal").textContent =
    i18n.formatCurrency(total);
}

// Format date to YYYY-MM-DD
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate() + 1).padStart(2, "0"); // Add 1 to fix date offset
  return `${year}-${month}-${day}`;
}

// Generate PDF
function generatePDF(event) {
  // Validate that we have required data
  const invoiceNumber = document.getElementById("invoiceNumber").value;
  const creationDate = document.getElementById("creationDate").value;
  const dueDate = document.getElementById("dueDate").value;

  if (!invoiceNumber) {
    alert(i18n.t("alerts.noInvoiceNumber"));
    return;
  }
  if (!creationDate) {
    alert(i18n.t("alerts.noCreationDate"));
    return;
  }
  if (!dueDate) {
    alert(i18n.t("alerts.noDueDate"));
    return;
  }

  // Check if we have at least one item with description
  const lineItems = document.querySelectorAll(".line-item");
  let hasValidItem = false;

  lineItems.forEach((item) => {
    const description = item.querySelector(".item-description").value.trim();
    if (description) {
      hasValidItem = true;
    }
  });

  if (!hasValidItem) {
    alert(i18n.t("alerts.noLineItems"));
    return;
  }

  // Update preview one more time to ensure it's current
  updatePreview();

  // Get the invoice content
  const element = document.querySelector(".invoice-content");
  const previewContainer = document.querySelector(".invoice-preview");

  // Store original styles
  const originalMaxHeight = previewContainer.style.maxHeight;
  const originalOverflow = previewContainer.style.overflow;
  const originalPadding = element.style.padding;

  // Temporarily adjust styles for better PDF rendering
  previewContainer.style.maxHeight = "none";
  previewContainer.style.overflow = "visible";
  element.style.padding = "1.5rem 2rem";

  // Calculate actual content height
  const actualHeight = element.scrollHeight;

  // Configure PDF options
  const opt = {
    margin: [0.4, 0.4, 0.4, 0.4],
    filename: `invoice_${invoiceNumber}_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      windowHeight: actualHeight,
      scrollY: 0,
      scrollX: 0,
    },
    jsPDF: {
      unit: "in",
      format: "letter",
      orientation: "portrait",
      compress: true,
    },
    pagebreak: {
      mode: ["avoid-all", "css"],
      avoid: [
        ".bank-details",
        ".bank-info",
        ".intermediary-bank",
        ".invoice-header",
        ".invoice-parties",
        ".invoice-dates",
      ],
    },
  };

  // Show loading indicator
  const btn = event
    ? event.target
    : document.querySelector('.btn-success[onclick="generatePDF()"]');
  const originalText = btn.textContent;
  btn.textContent = i18n.t("form.exporting");
  btn.disabled = true;

  // Generate PDF with a small delay to ensure DOM is ready
  setTimeout(() => {
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(function () {
        // Restore original styles
        previewContainer.style.maxHeight = originalMaxHeight;
        previewContainer.style.overflow = originalOverflow;
        element.style.padding = originalPadding;

        btn.textContent = originalText;
        btn.disabled = false;
        console.log("PDF generated successfully");
      })
      .catch(function (error) {
        // Restore original styles on error
        previewContainer.style.maxHeight = originalMaxHeight;
        previewContainer.style.overflow = originalOverflow;
        element.style.padding = originalPadding;

        btn.textContent = originalText;
        btn.disabled = false;
        console.error("Error generating PDF:", error);
        alert("Error generating PDF. Please try again.");
      });
  }, 100);
}

// Helper function to format currency
function formatCurrency(amount) {
  return i18n.formatCurrency(amount);
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + P to generate PDF
  if ((e.ctrlKey || e.metaKey) && e.key === "p") {
    e.preventDefault();
    generatePDF();
  }

  // Ctrl/Cmd + Enter to update preview
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    updatePreview();
  }
});
