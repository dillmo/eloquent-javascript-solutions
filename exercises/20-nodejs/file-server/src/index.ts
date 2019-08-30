const fileSelect = document.getElementById("file-select") as HTMLSelectElement;
const textArea = document.getElementById("file-content") as HTMLTextAreaElement;

fetch("/").then((response) => response.text()).then((text) => {
    text.split("\n").forEach((path, i) => {
        const selectOption = document.createElement("option");
        selectOption.text = path;
        fileSelect.appendChild(selectOption);
        if (i === 0) {
            setText();
        }
    });
});

fileSelect.onchange = setText;

function setText() {
    fetch(fileSelect.options[fileSelect.selectedIndex].text)
        .then((response) => response.text())
        .then((text) => {
            textArea.value = text;
        });
}

const form = document.getElementById("edit-form") as HTMLFormElement;
form.onsubmit = (event) => {
    event.preventDefault();
    fetch(fileSelect.options[fileSelect.selectedIndex].text, {
        body: textArea.value,
        method: "PUT",
    });
};
