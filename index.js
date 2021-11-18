let map;
let bounds;
let markers = [];
let id = null;
const POSTAL = "postal_code";

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8
  });
  bounds = new google.maps.LatLngBounds();
  
}

const ajaxHandle = () => {
    let enderecoValue = document.getElementById("address").value;
    let request = new XMLHttpRequest();
    
    let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${enderecoValue}&key=AIzaSyDw5sxkvC75XZoQf3ErxBvYLe1vtAHyXgI`;
    request.open("GET", url);
   
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            let jsonResult = JSON.parse(request.responseText);
            getPostal(jsonResult);
            
        }
    }
    request.send();

}

const getPostal = (jsonResult) => {
    let finalArray = [];
    
    let addressResults = jsonResult["results"][0]["address_components"];
    let geoResults = jsonResult["results"][0]["geometry"]["location"];

    console.log(jsonResult);
    
    for (let index = 0; index < addressResults.length; index++) {
        const element = addressResults[index];
        if(element["types"][0] == POSTAL) {
            finalArray.push(element["long_name"]);
        }
    }
    callPostmon(finalArray, geoResults)
}

const callPostmon = (finalArray, geoResults) => {    
    let url = `https://api.postmon.com.br/v1/cep/`;
    for (let index = 0; index < finalArray.length; index++) {
        let request = new XMLHttpRequest();
        
        const element = finalArray[index];
        let urlAtual = url+element;
        request.open("GET", urlAtual);
    
        request.send();
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if(request.responseText) {
                    var jsonResult = JSON.parse(request.responseText);
                    if(finalArray) {
                        let marker = new google.maps.Marker({
                            position: geoResults,
                            map,
                            title: finalArray[0],
                          });
                
                        var listener = google.maps.event.addListener(map, "idle", function() { 
                            if (map.getZoom() > 16) map.setZoom(16); 
                            google.maps.event.removeListener(listener); 
                        });
                        
                        bounds.extend(marker.position);
                        map.fitBounds(bounds);
                        markers.push(marker);
                    }
                    writeHTML(jsonResult);
                }
                else {
                    if(document.getElementById('error')){} else {
                        writeError();
                    }
                }  
            }
        }
    }
}

const writeError = () => {
    var error = document.getElementById('form-id');
    var msg = document.createElement('p');
    msg.id = 'error';
    msg.innerHTML = 'Nenhum endereço localizado!';
    msg.style.height = '0';
    msg.style.paddingBottom = '0';
    error.insertBefore(msg, error.firstChild);

    clearInterval(id);
    id = setInterval(frame, 10);
    function frame() {
        msg.style.height = '20px';
    }
}

const writeHTML = (jsonResult) => {
    if(document.getElementById('error')){
        let remove = document.getElementById('error');
        remove.remove();
    }
    let div = document.getElementById('result');
    let row = document.createElement('tr');

    let bairro = document.createElement('td');
    bairro.innerHTML = jsonResult.bairro;

    let logra = document.createElement('td');
    logra.innerHTML = jsonResult.logradouro;

    let cep = document.createElement('td');
    cep.innerHTML = jsonResult.cep;

    let cidade = document.createElement('td');
    cidade.innerHTML = jsonResult.cidade;

    let estado = document.createElement('td');
    estado.innerHTML = jsonResult.estado;
    
    let array = [cep, logra, bairro, cidade, estado];
    console.log(array);

    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        row.appendChild(element);
        
    }

    console.log(jsonResult);
    
    div.appendChild(row);
    
}