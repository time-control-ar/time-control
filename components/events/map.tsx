"use client"

import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { useState, useRef, useEffect } from 'react';
import { ExternalLinkIcon, SearchIcon } from 'lucide-react';
import { XIcon } from 'lucide-react';
import Image from 'next/image';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    padding: '10px',
};



const Map = ({
    onLocationSelect, value
}: {
    onLocationSelect: (location: { lat: number; lng: number }, locationName: string) => void;
    value: { lat: number; lng: number };
}) => {
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(value && typeof value === 'object' && 'lat' in value && 'lng' in value ? value : { lat: -34.397, lng: 150.644 });
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [search, setSearch] = useState('');

    const { isLoaded, loadError } = useGoogleMaps();

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
        <div className="flex flex-col gap-2">

            <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={handlePlaceChanged}
            >
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
            </Autocomplete>


            <div className=" w-full rounded-tl-3xl rounded-xl overflow-hidden relative h-[300px]">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={16}
                    options={{
                        mapId: '1234567890',
                        disableDefaultUI: true,
                        zoomControl: false,
                        streetViewControl: false,
                        fullscreenControl: true,
                        mapTypeControl: false,
                        scaleControl: true,
                        rotateControl: false,
                        clickableIcons: false,
                        styles: [
                            {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }]
                            }
                        ]
                    }}
                >
                    <Marker position={markerPosition} />
                </GoogleMap>

                <button
                    disabled={!markerPosition}
                    type='button'
                    className="absolute bottom-1 right-1 z-10 rounded-xl w-max h-[39px] backdrop-blur-sm border bg-white/20 border-gray-300 shadow-lg flex items-center gap-2 px-3  shadow-black/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                        const url = `https://www.google.com/maps?q=${markerPosition?.lat},${markerPosition?.lng}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                >
                    <div className="w-[16px] h-[22px] relative">
                        <Image src="/googlemaps.png" alt="Google Maps" fill />
                    </div>
                    <p className="text-sm font-medium tracking-tight text-gray-700">
                        Abrir en Google Maps
                    </p>
                    <ExternalLinkIcon className="w-4 h-4 text-gray-700" />
                </button>

            </div>

        </div >
    );
};

export default Map;