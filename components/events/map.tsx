"use client"

import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { useState, useEffect, useRef } from 'react';
import { SearchIcon } from 'lucide-react';
import { XIcon } from 'lucide-react';
import Image from 'next/image';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const Map = ({
    onLocationSelect, value
}: {
    onLocationSelect: (location: { lat: number; lng: number }, name: string, direction: string) => void;
    value: { lat: number; lng: number; name: string; direction: string };
}) => {
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(value && typeof value === 'object' && 'lat' in value && 'lng' in value ? value : { lat: -34.397, lng: 150.644 });
    const [searchValue, setSearchValue] = useState('');
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { isLoaded, loadError } = useGoogleMaps();

    useEffect(() => {
        if (value && typeof value === 'object' && 'lat' in value && 'lng' in value) {
            setMarkerPosition(value);
        }
    }, [value]);

    // Inicializar el autocompletado de Google Places
    useEffect(() => {
        if (isLoaded && inputRef.current && typeof window !== 'undefined' && window.google) {

            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['establishment', 'geocode'],
                componentRestrictions: { country: 'AR' }, // Restringir a Argentina
                fields: ['name', 'formatted_address', 'geometry', 'place_id', 'types']
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();

                if (place && place.geometry && place.geometry.location) {
                    const newPosition = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };

                    setMarkerPosition(newPosition);
                    setSearchValue(place.name || place.formatted_address || '');

                    // Log de la ubicación completa
                    if (place.name || place.formatted_address) {
                        onLocationSelect({
                            lat: newPosition.lat,
                            lng: newPosition.lng,
                        }, place.name || '', place.formatted_address || '');
                    }
                }
            });

            autocompleteRef.current = autocomplete;

            return () => {
                if (autocompleteRef.current) {
                    window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
                }
            };
        }
    }, [isLoaded, onLocationSelect]);

    // Función para limpiar el campo de búsqueda
    const clearSearch = () => {
        setSearchValue('');
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    };

    if (loadError) {
        return (
            <div className="rounded-2xl mt-3 overflow-hidden bg-white dark:bg-cdark border border-gray-100 dark:border-cblack">
                <div className="text-red-500 dark:text-red-400 text-sm tracking-tight p-3">
                    Error al cargar el mapa. Inténtalo de nuevo.
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="rounded-2xl mt-3 overflow-hidden bg-white dark:bg-cdark border border-gray-100 dark:border-cblack">
                <div className="text-gray-500 dark:text-gray-400 text-sm tracking-tight p-3">
                    Cargando mapa...
                </div>
            </div>
        );
    }


    return (
        <div className="flex flex-col gap-3">

            <div id="autocomplete-container" className="relative w-full">
                <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    className='input w-full !pl-12'
                    placeholder='Buscar ubicación...'
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            e.currentTarget.blur()
                        }
                    }}
                />

                {searchValue && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        title="Limpiar búsqueda"
                    >
                        <XIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                )}
            </div>

            {/* Mapa */}
            <div className="w-full rounded-2xl overflow-hidden relative h-[250px] border border-gray-200 dark:border-gray-700">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={15}
                    options={{
                        mapId: 'event-map',
                        disableDefaultUI: true,
                        zoomControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        mapTypeControl: false,
                        scaleControl: false,
                        rotateControl: false,
                        clickableIcons: false,
                        gestureHandling: 'greedy'
                    }}
                >
                    <Marker position={markerPosition} />
                </GoogleMap>

                {/* Botón "Ver en Maps" */}
                <button
                    disabled={!markerPosition}
                    type='button'
                    className="absolute top-3 left-3 z-10 rounded-xl w-max h-[40px] backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-lg border border-gray-200 dark:border-gray-600 flex items-center gap-2 px-3 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                        const url = `https://www.google.com/maps?q=${markerPosition?.lat},${markerPosition?.lng}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                >
                    <div className="w-[16px] h-[22px] relative scale-90">
                        <Image src="/googlemaps.png" alt="Google Maps" fill />
                    </div>
                    <p className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-200">
                        Ver en Maps
                    </p>
                </button>

                {/* Información de coordenadas */}
                {/* <div className="absolute bottom-3 left-3 z-10 rounded-lg px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                        <div>{value.name}</div>
                        <div>{value.direction}</div>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default Map;