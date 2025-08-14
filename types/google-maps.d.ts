declare namespace google.maps.places {
 interface PlaceAutocompleteElement extends HTMLElement {
  placeholder?: string;
  value?: string;
  addEventListener(
   type: "gmp-placeselect",
   listener: (event: PlaceAutocompleteEvent) => void
  ): void;
  removeEventListener(
   type: "gmp-placeselect",
   listener: (event: PlaceAutocompleteEvent) => void
  ): void;
 }

 interface PlaceAutocompleteEvent extends CustomEvent {
  detail: {
   place: google.maps.places.PlaceResult;
  };
 }

 // Extender la interfaz Autocomplete existente si es necesario
 interface Autocomplete {
  getPlace(): google.maps.places.PlaceResult;
  addListener(eventName: string, handler: () => void): void;
 }
}

declare global {
 namespace JSX {
  interface IntrinsicElements {
   "gmp-place-autocomplete": Partial<google.maps.places.PlaceAutocompleteElement>;
  }
 }
}
