import {APIProvider, Map} from '@vis.gl/react-google-maps';

import { NewCrotonDamMarker } from './markers'

interface LatLngBounds {
    east: number;
    west: number;
    north: number;
    south: number;
}

const watershedBounds: LatLngBounds = {
    east: -72.969559,
    west: -74.813818,
    north: 42.676299,
    south: 40.676299
}

export const WaterMap = () => {
    return(
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
            <Map
            style={{width: '100vw', height: '100vh'}}
            defaultCenter={{lat: 40.895687, lng: -73.605657}}
            defaultZoom={7}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            controlled={false}
            defaultBounds={watershedBounds}
            >
                <NewCrotonDamMarker />
            </Map>
        </APIProvider>
    );
}