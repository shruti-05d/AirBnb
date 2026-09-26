const mapContainer = document.getElementById("map");
const mapData = window.listingMapData || {};
const validCoordinates = Array.isArray(mapData.coordinates)
    && mapData.coordinates.length === 2
    && mapData.coordinates.every(Number.isFinite);

if (mapContainer && mapData.token && validCoordinates && window.mapboxgl) {
    mapboxgl.accessToken = mapData.token;

    const map = new mapboxgl.Map({
        container: mapContainer,
        center: mapData.coordinates,
        zoom: 9
    });

    new mapboxgl.Marker({ color: "red" })
        .setLngLat(mapData.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<h4>${escapeHtml(mapData.label || "")}</h4><p>Exact location provided after booking</p>`
            )
        )
        .addTo(map);
} else if (mapContainer) {
    mapContainer.textContent = "Map is unavailable for this listing.";
}

function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
}


