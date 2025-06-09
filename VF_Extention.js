(function() { // IIFE zur Kapselung des Scopes

  // Definition der FormExtension
  const FormExtension = {
    name: "Forms",
    type: "response",
    match: ({ trace }) =>
      trace?.type === "ext_customform" || trace?.payload?.name === "ext_customform",
    render: ({ trace, element }) => {
      const formContainer = document.createElement('form');

      formContainer.innerHTML = `
        <style>
          label {
            font-size: 0.8em;
            color: #888;
          }
          input[type="text"], input[type="email"], input[type="tel"] {
            width: 100%;
            border: none;
            border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
            background: transparent;
            margin: 5px 0;
            outline: none;
            padding: 8px 0;
          }
          .phone {
            width: 150px;
          }
          .invalid {
            border: red;
          }
          .submit {
            background: linear-gradient(to right, #2e6ee1, #2e7ff1);
            border: none;
            color: white;
            padding: 10px;
            border-radius: 5px;
            width: 100%;
            cursor: pointer;
          }
        </style>

        <label for="extnumber">Kundennummer</label>
        <input type="text" class="extnumber" name="extnumber" required><br><br>

        <label for="salut">Anrede</label>
        <input type="text" class="salut" name="salut" required><br><br>

        <label for="name1">Name</label>
        <input type="text" class="name1" name="name1" required><br><br>

        <label for="firstname">Vorname</label>
        <input type="text" class="firstname" name="firstname" required><br><br>

        <label for="street">Straße</label>
        <input type="text" class="street" name="street" required><br><br>

        <label for="zip">PLZ</label>
        <input type="text" class="zip" name="zip" required><br><br>

        <label for="city">Stadt</label>
        <input type="text" class="city" name="city" required><br><br>

        <label for="phone">Mobilnummer</label>
        <input type="text" class="phone" name="phone" required><br><br>

        <input type="submit" class="submit" value="Submit">
      `;

      formContainer.addEventListener('input', function () {
        // Entfernen der 'invalid' Klasse, wenn die Eingabe gültig wird

        const extnumber = formContainer.querySelector('.extnumber');
        const salut = formContainer.querySelector('.salut');
        const name1 = formContainer.querySelector('.name1');
        const firstname = formContainer.querySelector('.firstname');
        const street = formContainer.querySelector('.street');
        const zip = formContainer.querySelector('.zip');
        const city = formContainer.querySelector('.city');
        const phone = formContainer.querySelector('.phone');

        if (extnumber && extnumber.checkValidity()) extnumber.classList.remove('invalid');
        if (salut && salut.checkValidity()) salut.classList.remove('invalid');
        if (name1 && name1.checkValidity()) name1.classList.remove('invalid');
        if (firstname && firstname.checkValidity()) firstname.classList.remove('invalid');
        if (street && street.checkValidity()) street.classList.remove('invalid');
        if (zip && zip.checkValidity()) zip.classList.remove('invalid');
        if (city && city.checkValidity()) city.classList.remove('invalid');
        if (phone && phone.checkValidity()) phone.classList.remove('invalid');
      });

      formContainer.addEventListener('submit', function (event) {
        event.preventDefault();

        const extnumber = formContainer.querySelector('.extnumber');
        const salut = formContainer.querySelector('.salut');
        const name1 = formContainer.querySelector('.name1');
        const firstname = formContainer.querySelector('.firstname');
        const street = formContainer.querySelector('.street');
        const zip = formContainer.querySelector('.zip');
        const city = formContainer.querySelector('.city');
        const phone = formContainer.querySelector('.phone');

        if (
          !extnumber || !extnumber.checkValidity() ||
          !salut || !salut.checkValidity() ||
          !name1 || !name1.checkValidity() ||
          !firstname || !firstname.checkValidity() ||
          !street || !street.checkValidity() ||
          !zip || !zip.checkValidity() ||
          !city || !city.checkValidity() ||
          !phone || !phone.checkValidity()
        ) {
          if (extnumber) extnumber.classList.add('invalid');
          if (salut) salut.classList.add('invalid');
          if (name1) name1.classList.add('invalid');
          if (firstname) firstname.classList.add('invalid');
          if (street) street.classList.add('invalid');
          if (zip) zip.classList.add('invalid');
          if (city) city.classList.add('invalid');
          if (phone) phone.classList.add('invalid');
          return;
        }

        formContainer.querySelector('.submit').remove();

        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { extnumber: extnumber.value, salut: salut.value, name1: name1.value, firstname: firstname.value, street: street.value, zip: zip.value, city: city.value, phone: phone.value },
        });
      });

      element.appendChild(formContainer);
    },
  };

  const CameraExtension = {
    name: "Camera",
    type: "response",
    match: ({ trace }) =>
      trace?.type === "ext_camera" || trace?.payload?.name === "ext_camera",
    render: ({ trace, element }) => {
      const geminiAPIKey = trace.payload.geminiAPIKey || null;
      const question = trace.payload.question || null;

      if (geminiAPIKey && question) {
        const cameraContainer = document.createElement('div');

        // CSS für das Kamera-Widget
        cameraContainer.innerHTML = `
          <style>
            .cameraModal {
              display: flex;
              justify-content: center;
              align-items: center;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.7);
              z-index: 1000;
            }
            .modal-content {
              background: white;
              padding: 30px;
              border-radius: 15px;
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
              text-align: center;
              width: 90%;
              max-width: 500px;
              position: relative;
            }
            .close {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 24px;
              cursor: pointer;
              color: #aaa;
              transition: color 0.3s;
            }
            .close:hover {
              color: #555;
            }
            #video {
              width: 100%;
              border-radius: 10px;
              margin-bottom: 20px;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            #photo {
              width: 100%;
              border-radius: 10px;
              display: none;
              margin-top: 20px;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            .button-container {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }
            .button-container button {
              flex: 1;
              padding: 15px;
              margin: 5px;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              font-size: 16px;
              transition: background-color 0.3s, transform 0.3s;
            }
            .capture-btn {
              background-color: #28a745;
              color: white;
            }
            .retake-btn {
              background-color: #ffc107;
              color: white;
            }
            .close-btn {
              background-color: #dc3545;
              color: white;
            }
            .button-container button:hover {
              transform: scale(1.05);
            }
          </style>
          <div id="cameraModal" class="cameraModal">
            <div class="modal-content">
              <span class="close">×</span>
              <video id="video" autoplay></video>
              <img id="photo" alt="Captured Photo">
              <div class="button-container">
                <button class="capture-btn">Foto aufnehmen</button>
                <button class="retake-btn" style="display: none;">Neues Foto</button>
                <button class="close-btn">Schließen</button>
              </div>
              <canvas id="canvas" style="display:none;"></canvas>
            </div>
          </div>
        `;

        element.appendChild(cameraContainer);

        const modal = cameraContainer.querySelector('#cameraModal');
        const video = cameraContainer.querySelector('#video');
        const captureButton = cameraContainer.querySelector('.capture-btn');
        const retakeButton = cameraContainer.querySelector('.retake-btn');
        const closeButton = cameraContainer.querySelector('.close-btn');
        const canvas = cameraContainer.querySelector('#canvas');
        const photo = cameraContainer.querySelector('#photo');

        async function startCamera() {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = 'block';
            photo.style.display = 'none';
            captureButton.style.display = 'inline-block';
            retakeButton.style.display = 'none';
          } catch (err) {
            console.error("Fehler beim Zugriff auf die Kamera: ", err);
          }
        }

        function capturePhoto() {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageDataURL = canvas.toDataURL('image/jpeg');
          photo.setAttribute('src', imageDataURL);
          video.style.display = 'none';
          photo.style.display = 'block';
          captureButton.style.display = 'none';
          retakeButton.style.display = 'inline-block';

          // Sende die Bilddaten an Gemini API
          sendImageToGemini(imageDataURL);
        }

        async function sendImageToGemini(imageDataURL) {
          const base64Data = imageDataURL.split(",")[1];

          const bodyData = JSON.stringify({
            contents: [
              { parts: [
                { text: question },
                { inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }}
              ]}
            ],
            generationConfig: {
              response_mime_type: "application/json",
            }
          });

          try {
            const response = await fetch(
              'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + geminiAPIKey,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: bodyData,
              }
            );

            if (!response.ok) {
              throw new Error('Gemini HTTP error: ' + response.statusText);
            }

            const responseBody = await response.json();
            const geminiAnswer = responseBody.candidates[0].content.parts[0].text;

            window.voiceflow.chat.interact({
              type: 'complete',
              payload: { data: imageDataURL, answer: geminiAnswer }
            });
          } catch (error) {
            console.error("Fehler bei der Gemini API:", error);
          }
        }

        captureButton.addEventListener('click', capturePhoto);
        retakeButton.addEventListener('click', startCamera);
        closeButton.addEventListener('click', () => {
          modal.style.display = 'none';
          const tracks = video.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        });

        modal.querySelector('.close').addEventListener('click', () => {
          modal.style.display = 'none';
          const tracks = video.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        });

        startCamera();
      }
    }
  };
  
// FileUpload Extension
  const FileUploadExtension = {
    name: 'FileUpload',
    type: 'response',
    match: ({ trace }) =>
      trace?.type === 'ext_fileUpload' || trace?.payload?.name === 'ext_fileUpload',
    render: ({ trace, element }) => {
      const fileUploadContainer = document.createElement('div');
      fileUploadContainer.innerHTML = `
        <style>
          .my-file-upload {
            border: 2px dashed rgba(46, 110, 225, 0.3);
            padding: 20px;
            text-align: center;
            cursor: pointer;
          }
        </style>
        <div class='my-file-upload'>Drag and drop a PDF here or click to upload</div>
        <input type='file' style='display: none;' accept=".pdf">
    `;

      const fileInput = fileUploadContainer.querySelector('input[type=file]');
      const fileUploadBox = fileUploadContainer.querySelector('.my-file-upload');

      fileUploadBox.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', function () {
        const file = fileInput.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
          fileUploadContainer.innerHTML = '<div>Please upload a PDF file.</div>';
          return;
        }

        fileUploadContainer.innerHTML = `
          <img src='https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif' alt='Upload' width='50' height='50'>
        `;

        const reader = new FileReader();

        reader.onload = function(event) {
          const pdfBase64 = event.target.result.split(',')[1]; // Extract Base64 data
          sendToGemini(pdfBase64, fileUploadContainer);
        };

        reader.onerror = function(error) {
          console.error("Error reading PDF:", error);
          fileUploadContainer.innerHTML = '<div>Error reading the file.</div>';
        }

        reader.readAsDataURL(file);
      });

      element.appendChild(fileUploadContainer);
    },
  };
  async function sendToGemini(pdfBase64, fileUploadContainer) {
    const geminiAPIEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'; // Replace with your Gemini API endpoint
    const geminiAPIKey = trace.payload.geminiAPIKey || null;
    const prompt = trace.payload.question || null;

    try {
      const response = await fetch(geminiAPIEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ` + geminiAPIKey // Consider security best practices!
        },
        body: JSON.stringify({
          prompt: prompt,
          pdf_data: pdfBase64,  // Send the Base64 encoded PDF data
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini  API error: ` + response.status + response.statusText);
      }

      const result = await response.json();

    console.log("Gemini API Response:", result); //Log the response

      fileUploadContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif" alt="Done" width="50" height="50">`;

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: {
          gemini_response: result // Send the JSON response from Gemini
        },
      });
    } catch (error) {
      console.error("Error sending to Gemini API:", error);
      fileUploadContainer.innerHTML = '<div>Error processing the file with Gemini.</div>';
    }
  };

  (function(d, t) {
    var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
    v.onload = function() {
      window.voiceflow.chat.load({
        verify: { projectID: '6638e96af12b12cebc5fab34' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production',
        assistant: {
          extensions: [FormExtension, CameraExtension, FileUploadExtension]
        }
      });
    };
    v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    v.type = "text/javascript";
    s.parentNode.insertBefore(v, s);
  })(document, 'script');
})();
`;