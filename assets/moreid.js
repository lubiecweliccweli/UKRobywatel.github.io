var params = new URLSearchParams(window.location.search);
var detailsData = {};

for (var key of params.keys()) {
  detailsData[key] = params.get(key);
}

setDetailsText("detailsSeries", detailsData.mdow_series || "MWYC 00000");
setDetailsText("detailsAuthority", detailsData.issuingAuthority || "URZĄD MIASTA WARSZAWA");
setDetailsText("detailsExpiryDate", detailsData.expiry_date || "14.07.2028");
setDetailsText("detailsIssueDate", detailsData.issue_date || "14.07.2023");

var updateValue = document.querySelector(".bottom_update_value");
if (updateValue) {
  updateValue.textContent = detailsData.issue_date || localStorage.getItem("update") || "14.07.2023";
}

var updateButton = document.querySelector(".update");
if (updateButton) {
  updateButton.addEventListener("click", function () {
    var currentDate = new Date().toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "numeric",
      day: "2-digit"
    });
    localStorage.setItem("update", currentDate);
    if (updateValue) {
      updateValue.textContent = currentDate;
    }
  });
}

var copyButton = document.querySelector(".value-copy button");
if (copyButton) {
  copyButton.addEventListener("click", function () {
    var series = document.getElementById("detailsSeries");
    var value = series ? series.textContent : "";
    if (navigator.clipboard && value) {
      navigator.clipboard.writeText(value);
    }
  });
}

function setDetailsText(id, value) {
  var element = document.getElementById(id);
  if (element && value) {
    element.textContent = value;
  }
}
