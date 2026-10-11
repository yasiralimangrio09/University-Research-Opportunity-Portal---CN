
const API_URL = "http://127.0.0.1:8000/api/opportunities";

const opportunityForm = document.getElementById("opportunity-form");
const formSection = document.getElementById("form-section");
const formTitle = document.getElementById("form-title");
const saveButton = document.getElementById("save-button");
const showFormButton = document.getElementById("show-form-button");
const cancelFormButton = document.getElementById("cancel-form-button");
const opportunitiesList = document.getElementById("opportunities-list");
const messageBox = document.getElementById("message");
const detailsSection = document.getElementById("details-section");
const detailsTitle = document.getElementById("details-title");
const opportunityDetails = document.getElementById("opportunity-details");
const closeDetailsButton = document.getElementById("close-details-button");

let editingId = null;
let messageTimer = null;

// Display a success or error message.
function showMessage(message, type = "success") {
    messageBox.textContent = message;
    messageBox.className = `message ${type}`;

    if (messageTimer !== null) {
        clearTimeout(messageTimer);
    }

    messageTimer = setTimeout(() => {
        messageBox.className = "message";
        messageBox.textContent = "";
        messageTimer = null;
    }, 5000);
}

// Send a request to the backend API.
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { detail: text };
        }
    }

    if (!response.ok) {
        const errorMessage =
            data?.detail || `Request failed with status ${response.status}`;
        throw new Error(
            typeof errorMessage === "string"
                ? errorMessage
                : JSON.stringify(errorMessage)
        );
    }

    return data;
}

// Create HTML elements safely for displaying text.
function createElement(tag, className, text = "") {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

// Build an opportunity card using API data.
function createOpportunityCard(opportunity) {
    const card = createElement("article", "opportunity-card");

    const top = createElement("div", "card-top");
    const title = createElement("h3", "", opportunity.title);
    const statusClass =
        opportunity.status === "Open" ? "status-open" : "status-closed";
    const status = createElement(
        "span",
        `status-badge ${statusClass}`,
        opportunity.status
    );

    top.append(title, status);

    const description = createElement(
        "p",
        "card-description",
        opportunity.description
    );

    const meta = createElement("div", "card-meta");

    const metaItems = [
        ["Research Area", opportunity.research_area],
        ["Faculty", opportunity.faculty_name],
        ["Department", opportunity.department],
        ["Positions", String(opportunity.available_positions)],
        ["Deadline", String(opportunity.application_deadline).slice(0, 10)]
    ];

    metaItems.forEach(([label, value]) => {
        const item = createElement("div", "meta-item");
        item.append(
            createElement("small", "", label),
            createElement("span", "", value)
        );
        meta.appendChild(item);
    });

    const actions = createElement("div", "card-actions");

    const viewButton = createElement("button", "secondary-button", "View Details");
    viewButton.type = "button";
    viewButton.addEventListener("click", () => viewOpportunity(opportunity.id));

    const editButton = createElement("button", "secondary-button", "Edit");
    editButton.type = "button";
    editButton.addEventListener("click", () => editOpportunity(opportunity.id));

    actions.append(viewButton, editButton);

    if (opportunity.status === "Open") {
        const closeButton = createElement("button", "secondary-button", "Close Opportunity");
        closeButton.type = "button";
        closeButton.addEventListener("click", () => closeOpportunity(opportunity.id));
        actions.appendChild(closeButton);
    }

    const deleteButton = createElement("button", "danger-button", "Delete");
    deleteButton.type = "button";
    deleteButton.addEventListener("click", () => deleteOpportunity(opportunity.id));

    actions.appendChild(deleteButton);
    card.append(top, description, meta, actions);

    return card;
}

// Load all opportunities from the API.
async function loadOpportunities() {
    opportunitiesList.replaceChildren(
        createElement("p", "loading-text", "Loading opportunities...")
    );

    try {
        const opportunities = await apiRequest(API_URL);
        opportunitiesList.replaceChildren();

        if (!Array.isArray(opportunities) || opportunities.length === 0) {
            opportunitiesList.appendChild(
                createElement(
                    "p",
                    "empty-state",
                    "No research opportunities found. Add the first opportunity!"
                )
            );
            return;
        }

        opportunities.forEach((opportunity) => {
            opportunitiesList.appendChild(createOpportunityCard(opportunity));
        });
    } catch (error) {
        opportunitiesList.replaceChildren(
            createElement(
                "p",
                "empty-state",
                `Could not load opportunities: ${error.message}. Make sure the backend is running.`
            )
        );
    }
}

// Open a blank form for creating an opportunity.
function openCreateForm() {
    editingId = null;
    opportunityForm.reset();
    formTitle.textContent = "Create Opportunity";
    saveButton.textContent = "Save Opportunity";
    formSection.classList.remove("hidden");
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Hide the form and clear the editing state.
function hideForm() {
    formSection.classList.add("hidden");
    editingId = null;
    opportunityForm.reset();
}

// Convert a date value into the format required by an HTML date input.
function formatDate(dateValue) {
    return String(dateValue).slice(0, 10);
}

// Load one opportunity and fill the form for editing.
async function editOpportunity(id) {
    try {
        const opportunity = await apiRequest(`${API_URL}/${id}`);

        editingId = id;
        formTitle.textContent = "Edit Opportunity";
        saveButton.textContent = "Update Opportunity";

        for (const field of opportunityForm.elements) {
            if (field.name && Object.hasOwn(opportunity, field.name)) {
                field.value = opportunity[field.name] ?? "";
            }
        }

        document.getElementById("application_deadline").value =
            formatDate(opportunity.application_deadline);

        formSection.classList.remove("hidden");
        detailsSection.classList.add("hidden");
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// Submit the form to create or update an opportunity.
opportunityForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(opportunityForm);
    const opportunity = Object.fromEntries(formData.entries());

    opportunity.available_positions = Number(opportunity.available_positions);

    const requiredFields = [
        "title",
        "description",
        "research_area",
        "faculty_name",
        "department",
        "required_skills",
        "application_deadline"
    ];

    for (const fieldName of requiredFields) {
        if (!String(opportunity[fieldName] ?? "").trim()) {
            showMessage("Please fill in all required fields.", "error");
            document.getElementById(fieldName).focus();
            return;
        }
    }

    if (
        !Number.isInteger(opportunity.available_positions) ||
        opportunity.available_positions < 1
    ) {
        showMessage("Available positions must be a whole number greater than zero.", "error");
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {
        if (editingId === null) {
            await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify(opportunity)
            });
            showMessage("Research opportunity created successfully.");
        } else {
            await apiRequest(`${API_URL}/${editingId}`, {
                method: "PUT",
                body: JSON.stringify(opportunity)
            });
            showMessage("Research opportunity updated successfully.");
        }

        hideForm();
        await loadOpportunities();
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        saveButton.disabled = false;
        saveButton.textContent =
            editingId === null ? "Save Opportunity" : "Update Opportunity";
    }
});

// Show full details for one opportunity.
async function viewOpportunity(id) {
    try {
        const opportunity = await apiRequest(`${API_URL}/${id}`);

        detailsTitle.textContent = opportunity.title;
        opportunityDetails.replaceChildren();

        const details = [
            ["Description", opportunity.description],
            ["Research Area", opportunity.research_area],
            ["Faculty Name", opportunity.faculty_name],
            ["Department", opportunity.department],
            ["Required Skills", opportunity.required_skills],
            ["Available Positions", String(opportunity.available_positions)],
            ["Application Deadline", formatDate(opportunity.application_deadline)],
            ["Status", opportunity.status],
            ["Opportunity ID", String(opportunity.id)]
        ];

        const grid = createElement("div", "details-grid");

        details.forEach(([label, value]) => {
            const item = createElement("div", "detail-item");
            item.append(
                createElement("small", "", label),
                createElement("p", "", value)
            );
            grid.appendChild(item);
        });

        opportunityDetails.appendChild(grid);
        detailsSection.classList.remove("hidden");
        detailsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// Change an opportunity's status from Open to Closed.
async function closeOpportunity(id) {
    if (!confirm("Are you sure you want to close this opportunity?")) {
        return;
    }

    try {
        const opportunity = await apiRequest(`${API_URL}/${id}`);

        opportunity.status = "Closed";

        await apiRequest(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(opportunity)
        });

        showMessage("Opportunity closed successfully.");
        await loadOpportunities();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// Delete an opportunity from the database.
async function deleteOpportunity(id) {
    if (!confirm("Are you sure you want to permanently delete this opportunity?")) {
        return;
    }

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        showMessage("Research opportunity deleted successfully.");
        detailsSection.classList.add("hidden");
        await loadOpportunities();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// Connect page buttons to their functions.
showFormButton.addEventListener("click", openCreateForm);
cancelFormButton.addEventListener("click", hideForm);
closeDetailsButton.addEventListener("click", () => {
    detailsSection.classList.add("hidden");
});

// Load database records when the page opens.
loadOpportunities();
