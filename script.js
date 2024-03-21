// Global array to store detected letters
var detectedLetters = [];
$(document).ready(function () {
  var video = document.getElementById("videoElement");
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  var captureButton = document.getElementById("captureButton");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Could not access the camera: " + error);
    });

  $("#uploadForm").submit(function (event) {
    event.preventDefault();
    var fileInput = document.getElementById("imageInput");
    var formData = new FormData();
    formData.append("image", fileInput.files[0]);
    processImage(formData);
  });

  captureButton.addEventListener("click", function () {
    // context.drawImage(video, 0, 0, 100, 100);
    context.drawImage(video, 0, 0, 270, 150);
    // context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    canvas.toBlob(function (blob) {
      var formData = new FormData();
      formData.append("image", blob);
      processImage(formData);
    });
  });
  function processImage(formData) {
    $.ajax({
      url: "https://southcentralus.api.cognitive.microsoft.com/customvision/v3.0/Prediction/638afed1-22b2-4713-8e96-47d2a436520e/detect/iterations/Iteration2/image",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        "Prediction-Key": "a494b65885ec47b8ac8f1d15c7e62805",
      },
      success: function (response) {
        var predictions = response.predictions;
        var resultContainer = document.getElementById("resultContainer");
        var resultHeading = document.getElementById("resultHeading");
        resultContainer.innerHTML = "";
        resultHeading.innerHTML = "";

        if (predictions.length > 0) {
          var maxProbability = 0;
          var predictedTag = "";
          for (var i = 0; i < predictions.length; i++) {
            var prediction = predictions[i];
            console.log(
              prediction.tagName +
                ": " +
                (prediction.probability * 100).toFixed(2) +
                "%"
            ); // Log tag name and its probability
            if (prediction.probability > maxProbability) {
              maxProbability = prediction.probability;
              predictedTag = prediction.tagName;
            }
          }

          // Add detected letter to the array
          detectedLetters.push(predictedTag);

          // Update UI to display detected letters
          updateDetectedLettersUI();

          resultHeading.innerHTML =
            '<h2 class="result-heading">This sign means the alphabet ' +
            predictedTag +
            "</h2>";
        } else {
          resultContainer.innerHTML = "<p>No predictions found.</p>";
        }
      },

      error: function () {
        var resultContainer = document.getElementById("resultContainer");
        var resultHeading = document.getElementById("resultHeading");
        resultContainer.innerHTML =
          "<p>An error occurred while processing the image.</p>";
        resultHeading.innerHTML = "";
      },
    });
  }
});
// Function to update UI with detected letters
function updateDetectedLettersUI() {
  var resultContainer = document.getElementById("resultContainer");
  var result = '<div class="result-container">';
  for (var i = 0; i < detectedLetters.length; i++) {
    result += '<div class="prediction">';
    result += '<p class="tag-name">' + detectedLetters[i] + "</p>";
    result += "</div>";
  }
  result += "</div>";
  resultContainer.innerHTML = result;

  // Add event listener to clear button
  var clearButton = document.getElementById("clearButton");
  clearButton.addEventListener("click", function () {
    clearDetectedLetters();
  });
}

// Function to clear detected letters
function clearDetectedLetters() {
  detectedLetters = [];
  updateDetectedLettersUI(); // Update UI to show no letters detected
}