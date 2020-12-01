
import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
  StatusBar,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import HMSLocation from '@hmscore/react-native-hms-location';
import { HmsLocalNotification } from '@hmscore/react-native-hms-push'


const showNotification = (title, message) => {
  const notification = {
    [HmsLocalNotification.Attr.title]: title,
    [HmsLocalNotification.Attr.message]: message, // (required)

  };

  // LocalNotification
  HmsLocalNotification.localNotification(notification)
    .then((result) => {
      this.log("LocalNotification Default", result);
    })
    .catch((err) => {
      //alert("[LocalNotification Default] Error/Exception: " + JSON.stringify(err));
    });

};

const Permissions = () => {
    const [hasLocationPermission, setHasLocationPermission] = useState(false);

    useEffect(() => {
        HMSLocation.LocationKit.Native.init()
            .then(_ => console.log("Done loading"))
            .catch(ex => console.log("Error while initializing." + ex));
    }, []);

    useEffect(() => {
        // Check location permissions
        HMSLocation.FusedLocation.Native.hasPermission()
            .then(result => setHasLocationPermission(result.hasPermission))
            .catch(ex => console.log("Error while getting location permission info: " + ex));
    }, []);

    const requestLocationPermission = useCallback(() => {
        HMSLocation.FusedLocation.Native.requestPermission()
        .then(result => setHasLocationPermission(result.granted));
    }, []);

    return (
        <>
          <View style={styles.sectionContainer}>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionTitle}>Permissions</Text>
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Button
                title="Request Permission"
                onPress={requestLocationPermission}
                />
            </View>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.monospaced}>{JSON.stringify(hasLocationPermission, null, 2)}</Text>
            </View>
          </View>
        </>
    )
};

const LocationSettings = () => {
    const [locationSettings, setLocationSettings] = useState();

    const checkLocationSettings = useCallback(() => {
        const locationRequest = {
            priority: HMSLocation.FusedLocation.PriorityConstants.PRIORITY_HIGH_ACCURACY,
            interval: 10000,
            numUpdates: 10,
            fastestInterval: 10000,
            expirationTime: 100000,
            expirationTimeDuration: 100000,
            smallestDisplacement: 0,
            maxWaitTime: 1000.0,
            needAddress: false,
            language: "en",
            countryCode: "en",
        };

        const locationSettingsRequest = {
            locationRequests: [locationRequest],
            alwaysShow: false,
            needBle: false,
        };

        HMSLocation.FusedLocation.Native.checkLocationSettings(locationSettingsRequest)
            .then(res => setLocationSettings(res))
            .catch(ex => console.log("Error while getting location settings. " + ex))
    });

    return (
        <>
          <View style={styles.sectionContainer}>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionTitle}>Location Settings</Text>
              <Button title="Check" onPress={checkLocationSettings} />
            </View>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionDescription}>
              </Text>
            </View>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.monospaced}>
                {JSON.stringify(locationSettings, null, 2)}
              </Text>
            </View>
          </View>
        </>
    );
};

const Location = () => {
    const LocationRequest = {
      priority: HMSLocation.FusedLocation.PriorityConstants.PRIORITY_HIGH_ACCURACY,
      interval: 3,
      numUpdates: 10,
      fastestInterval: 1000.0,
      expirationTime: 1000.0,
      expirationTimeDuration: 1000.0,
      smallestDisplacement: 0.0,
      maxWaitTime: 10000.0,
      needAddress: true,
      language: 'en',
      countryCode: 'en',
  };
  const [locationAddress, setLocationAddress] = useState();

  const getLocation = useCallback(() => {
      HMSLocation.FusedLocation.Native.getLastLocationWithAddress(LocationRequest)
          .then(pos => setLocationAddress(pos))
          .catch(err => console.log('Failed to get last location', err));
  }, []);

  return (
      <>
        <View style={styles.sectionContainer}>
          <View style={styles.spaceBetweenRow}>
            <Text style={styles.sectionTitle}>Last Location Address</Text>
            <Button title="Get location address" onPress={getLocation} />
          </View>
          <View style={styles.spaceBetweenRow}>
            <Text style={styles.monospaced}>
              {JSON.stringify(locationAddress, null, 2)}
            </Text>
          </View>
        </View>
      </>
  )
};

const Geofence = () => {
    const [reqCode, setReqCode] = useState(1);
    const [activated, setActivated] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [geofenceResponse, setGeofenceResponse] = useState();

    const geofence = {
        longitude: 41.0,
        latitude: 29.0,
        radius: 2000.0,
        uniqueId: 'com.locationgeofence.GEOFENCE',
        conversions: 4,
        validContinueTime: 10000.0,
        dwellDelayTime: 10,
        notificationInterval: 1,
    };

    const geofenceRequest = {
        geofences: [geofence],
        conversions: 4,
        coordinate: 1,
    };

    const setNotification = () => {
      HMSLocation.LocationKit.Native.setNotification({contentTitle: "Geofence", contentText: "Geofence Triggered", defType: "mipmap", resourceName: "ic_launcher"})
      .then(result =>console.log('Notification set:', result))
      .catch(err => console.log('Failed to set notification', err));
    };

    const createGeofenceList = useCallback(requestCode => {
        HMSLocation.Geofence.Native.createGeofenceList(
            requestCode,
            geofenceRequest.geofences,
            geofenceRequest.conversions,
            geofenceRequest.coordinate,
        )
            .then(res => {
                console.log(res);
                setNotification();
            })
            .catch(err => {
                console.log(err);
            });
    })

    const deleteGeofenceList = useCallback(requestCode => {
        HMSLocation.Geofence.Native.deleteGeofenceList(requestCode)
            .then(res => {
              console.log(res);
              setActivated(false);
            })
            .catch(err => console.log('ERROR: GeofenceList deletion failed', err))
    }, []);

    const handleGeofenceEvent = useCallback(geo => {
        console.log('GEOFENCE : ', geo);
        showNotification('Geofence', 'Geofence triggered in foreground.');
        setGeofenceResponse(geo);
    });

    const addGeofenceEventListener = useCallback(() => {
        HMSLocation.Geofence.Events.addGeofenceEventListener(
            handleGeofenceEvent()
        );
        setSubscribed(true);
    }, []);

    const removeGeofenceEventListener = useCallback(() => {
        HMSLocation.Geofence.Events.removeGeofenceEventListener(
            handleGeofenceEvent()
        )
        setSubscribed(false);
    })

    return (
        <>
          <View style={styles.sectionContainer}>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionTitle}>Geofence</Text>
            </View>
            <View style={styles.centralizeContent}>
              <Button
                title={activated ? "Remove Geofence" : "Create Geofence"}
                onPress={() => {
                    if (activated) {
                        deleteGeofenceList(reqCode)
                    } else {
                        createGeofenceList(reqCode)
                    }
                }} />
                <Button
                  title={subscribed ? "Unsubscribe" : "Subscribe"}
                  onPress={() => {
                      if (subscribed) {
                          removeGeofenceEventListener()
                      } else {
                          addGeofenceEventListener()
                      }
                  }} />
            </View>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionDescription}>
                <Text style={styles.boldText}>Geofence Request Code</Text>:{' '}
                {`${reqCode || ''}`}
              </Text>
            </View>
            <Text style={styles.boldText}>
              {JSON.stringify(geofenceResponse, null, 2)}
            </Text>
          </View>
        </>
    )
};

const App = () => {

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Permissions />
          <LocationSettings />
          <Location />
          <Geofence />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '400',
    color: Colors.dark,
  },
  spaceBetweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  centralizeContent: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  monospaced: {
    fontFamily: 'monospace'
  },
});

export default App;
