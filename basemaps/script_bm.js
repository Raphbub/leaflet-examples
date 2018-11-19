// Initialisation de la carte
let map = L.map('map', {
  center: [46.52340, 6.57983],
  minZoom: 15,
  maxZoom: 19,
  zoom: 16,
  maxBounds: [
    [46.53197, 6.600122],
    [46.51425, 6.560082]
  ],
  maxBoundsViscosity: 0.8
});

// Création de 3 variables contenant les couches de base
let osm_class = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  label: 'OSM classique' // s'affiche au survol de la vignette
});

let carto_positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  label: 'CARTO positron' // s'affiche au survol de la vignette
});

let stamen_watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  label: 'Stamen watercolor' // s'affiche au survol de la vignette
});

// Création d'un array avec les couches/cartes de base
let basemaps = [
  carto_positron, // La première de la liste sera celle affichée de base
  osm_class,
  stamen_watercolor
];

/* Ajout des vignettes à la carte
 les options tileX, Y, Z correspondent à l'extrait de tuile voulu, ce site
 permet de trouver les coordonnées d'une tuile particulière:
 http://www.maptiler.com/google-maps-coordinates-tile-bounds-projection/
*/
map.addControl(L.control.basemaps({
    basemaps: basemaps, // les couches de base
    tileX: 132, // tile X coordinate
    tileY: 90,  // tile Y coordinate
    tileZ: 8    // tile zoom level
  })
);

// Ajout d'une couche de bâtiments (variable bats_unil définie dans bat_unil.js)
let bats = L.geoJSON(bats_unil, {
  style: function(bat) { // style en fonction du nom du bâtiment
    if(bat.properties.name == "Geopolis") { // Si le nom est géopolis, le mettre
      return {color: "chartreuse", // vert
              weight: 2, // avec un tour d'une épaisseur de 1
              class: "bats"
             }
    } else { // sinon
      return {color: "coral", // corail
              weight: 0 // sans contour
             }
    }
  }, // onEachFeature permet de répéter une fonction pour chaque éléments
     // on peut utiliser le bâtiment et la couche qui va être rajoutée (ici, poly)
  onEachFeature: function(bat, poly) {
    // Enregistrer le nom dans une variable temporaire
    let nom = bat.properties.name;

    if (nom == "Geopolis") { // Si le nom est Geopolis,
      // poly.bindPopup(`<b>${nom}</b>`); // entoure le nom d'une balise <b> pour le mettre en gras
      poly.bindTooltip("Clique-moi!", {sticky: true})
    } else { // sinon
      poly.bindPopup(nom); // ajout d'un popup simple
    }
  }
}).addTo(map);

// Ajout de la couche des bâtiments dans un array qui contient les couches ajoutées à la carte (overlay)
let overlays = {
  "Batiments": bats
};
// Ajout d'un sélecteur de couche
  // le premier est undefined car les couches de base sont déja dans le L.control.basemaps
L.control.layers(undefined, overlays).addTo(map);

// Ajout d'une échelle
L.control.scale({
  imperial: false // Omission de l'échelle impériale
}).addTo(map);

/* 2-3 fonctions à titre d'exemple */
// Avertissement (tardif) qu'il n'y a qu'une couche
map.on('overlayremove', function(overlay) {
  alert("L'unique couche va être enlevée !")
});
// Affiche les coordonnées de la souris au-dessous de la carte
map.on('mousemove', function(e) {
  let lat = e.latlng.lat;
  let long = e.latlng.lng;
  document.getElementById('latlng').innerHTML = `${lat.toFixed(5)}/${long.toFixed(5)}`;
});
// Affiche Non applicable quand la souris est hors de la carte
map.on('mouseout', function() {
  document.getElementById('latlng').innerHTML = "N/A"
});

// Création d'un icon Zélig
let marqueurZelig = L.icon({
  iconUrl: "logo.png",
  iconAnchor: [15,15]
});
// Création du marqueur Zélig
let zelig = L.marker([46.52607, 6.58005], {icon: marqueurZelig}).bindPopup("Zelig est ici");
// Ajout d'une fonction qui ouvre le site web quand on clique sur le marqueur
zelig.on('click', function() {
  window.open("https://www.zelig.ch/", "_blank");
});

// Ajout d'un id à chaque path
bats.eachLayer(function(poly) {
  poly._path.id = poly.feature.properties.name;
});
// Création d'une variable contenant le path (dessin) de géopolis
let geop = document.getElementById('Geopolis');
// Ajout d'une fonction lors d'un clic sur le path
geop.addEventListener('click', function(e) {
  // Récupération de la couleur actuelle
  let altColor = e.target.attributes.fill.nodeValue;
  // S'il est de base
  if(altColor == "chartreuse") {
    geop.setAttribute("fill", "darkgreen"); // changement de la couleur
    geop.setAttribute("fill-opacity", 0.5); // changement de l'opacité
    geop.setAttribute("stroke-width", 0); // dispartion du contour
  } else { // sinon, rétablissement des paramètres d'origine
    geop.setAttribute("fill", "chartreuse");
    geop.setAttribute("fill-opacity", 0.2);
    geop.setAttribute("stroke-width", 1);
  }

  // Enregistrement de la réponse de l'utilisateur à la question suivante
  let age_legal = confirm("As-tu 18 ans révolus?");
  // Si la personne est majeure,
  if (age_legal) {
    zelig.addTo(map); // ajout du marqueur sur la carte
    e.stopPropagation(); // Arrête la propagation de l'évènement
    zelig.openPopup(); // ce qui de garder le popup ouvert
  } else { // sinon
    map.removeLayer(zelig); // suppression du marqueur (ou non ajout)
  }
});

// Affiche une alerte quand l'utilisateur double-clique trop
let dblClkTot = 0; // Initialise une variable à zéro
map.on('dblclick', function() { // Fonction exécutée lors d'un double clic
  dblClkTot++; // Augmentation du compteur de double-clic
  if (dblClkTot >= 3) { // Si le compteur est supérieur ou égal à 3
    alert("Doucement avec les doubles-clics"); // Affiche une alerte
  }
});
