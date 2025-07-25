"use client"

import { GoogleMap, Marker, Autocomplete, useLoadScript } from '@react-google-maps/api';
import { useState, useRef, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { XIcon } from 'lucide-react';

const mapContainerStyle = {
    width: '100%',
    height: '300px',
    padding: '10px',
    borderRadius: '10px',
};

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

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries,
    });

    useEffect(() => {
        if (value && typeof value === 'object' && 'lat' in value && 'lng' in value) {
            setMarkerPosition(value);
        }
    }, [value]);

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

    if (loadError) {
        return (
            <div className="rounded-2xl mt-3 overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                <div className="text-red-500 dark:text-red-400 text-sm tracking-tight p-3">
                    Error al cargar el mapa. Inténtalo de nuevo.
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="rounded-2xl mt-3 overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                <div className="text-gray-500 dark:text-gray-400 text-sm tracking-tight p-3">
                    Cargando mapa...
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl overflow-hidden border-2 border-gray-50 dark:border-gray-800 p-3">
            <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={handlePlaceChanged}
            >
                <div className="pb-3">
                    <div className="flex relative">
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white" />
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
                zoom={15}
            >
                <Marker position={markerPosition} />
            </GoogleMap>
        </div>
    );
};

export default Map;