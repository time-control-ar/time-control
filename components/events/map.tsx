"use client"

import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { useState, useRef, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { XIcon } from 'lucide-react';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

// Mover el array de libraries fuera del componente para evitar recreaciones
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];

const Map = ({
    onLocationSelect, value
}: {
    onLocationSelect: (location: { lat: number; lng: number }, locationName: string) => void;
    value: { lat: number; lng: number };
}) => {
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(value && typeof value === 'object' && 'lat' in value && 'lng' in value ? value : { lat: -34.397, lng: 150.644 });
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [search, setSearch] = useState('');

    // Verificar si la ubicación es válida (no es la ubicación por defecto)
    const isLocationValid = markerPosition.lat !== -34.397 || markerPosition.lng !== 150.644;

    useEffect(() => {
        if (value && typeof value === 'object' && 'lat' in value && 'lng' in value) {
            setMarkerPosition(value);
        }
    }, [value]);

    // const handleMapClick = (event: google.maps.MapMouseEvent) => {
    //     if (event.latLng) {
    //         const newPosition = {
    //             lat: event.latLng.lat(),
    //             lng: event.latLng.lng(),
    //         };
    //         setMarkerPosition(newPosition);
    //         onLocationSelect(newPosition);
    //     }
    // };

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current?.getPlace();

        if (place?.geometry?.location) {
            const newPosition = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            setMarkerPosition(newPosition);
            onLocationSelect(newPosition, place?.name || '');
        }
    };

    return (
        <div className="rounded-2xl mt-3 overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <LoadScript
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                libraries={libraries}
                loadingElement={<div className="text-gray-500 dark:text-gray-400 text-sm tracking-tight p-3">Cargando mapa...</div>}
            >
                <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={handlePlaceChanged}
                >
                    <div className="p-3">
                        <div className="flex relative">
                            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white z-20" />
                            <input
                                type="text"
                                placeholder="Buscar"
                                className="rounded-search-input w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        e.currentTarget.blur()
                                    }
                                }}
                            />

                            {search && (
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')} disabled={!search}>
                                    <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                                </button>
                            )}
                        </div>
                    </div>
                </Autocomplete>

                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={10}
                // onClick={handleMapClick}
                >
                    <Marker position={markerPosition} />
                </GoogleMap>

                {!isLocationValid && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">!</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Ubicación no seleccionada
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    Usa el buscador arriba para encontrar y seleccionar la ubicación exacta del evento.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </LoadScript>
        </div>
    );
};

export default Map;