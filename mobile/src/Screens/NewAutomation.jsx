import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Linking,
} from "react-native";

import {
  useNavigation,
  useTheme
} from "@react-navigation/native";

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getServices, addNewAutomation, serviceOauth } from '../Core/ServerCalls';
import { NewAutomation_Triggers1, NewAutomation_Triggers2 } from "./NewAutomation_Triggers";
import { NewAutomation_Reactions1, NewAutomation_Reactions2 } from "./NewAutomation_Reactions";
import Button from "../Components/Button";
import { useContext } from 'react';
import { useSettings } from '../Contexts/Settings';
import { ServiceRecap } from "../Components/ServiceCard";

function NewAutomation_Submit({ route }) {
  const { settings, t } = useSettings();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { serviceData, triggerServiceId, triggerId, triggerParams, reactionServiceId, reactionId, reactionParams } = route.params;
  const [triggerService, setTriggerService] = useState(null);
  const [trigger, setTrigger] = useState(null);
  const [reactionService, setReactionService] = useState(null);
  const [reaction, setReaction] = useState(null);

  useEffect(() => {
    setTriggerService(serviceData.find(service => service.id === triggerServiceId));
    setTrigger(serviceData.find(service => service.id === triggerServiceId).triggers.find(trigger => trigger.id === triggerId));
    setReactionService(serviceData.find(service => service.id === reactionServiceId));
    setReaction(serviceData.find(service => service.id === reactionServiceId).reactions.find(reaction => reaction.id === reactionId));
  }, []);

  const submit = async () => {
    const connect = async (service_id) => {
      try {
        const response = await serviceOauth(settings.apiBaseUrl, service_id);
        await Linking.openURL(response.url);
      } catch (error) {
        console.error('Service error:', error);
      }
    };

    const resp = await addNewAutomation(settings.apiBaseUrl, triggerServiceId, triggerId, triggerParams, reactionServiceId, reactionId, reactionParams);
    if (resp.status === 401) {
      await connect(resp.service_id);
    } else {
      navigation.navigate('AutomationsTab');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ServiceRecap service={triggerService} elem={trigger} />
      <Image style={styles.arrow} source={require('../../assets/down_arrow.png')} tintColor={colors.text} />
      <ServiceRecap service={reactionService} elem={reaction} />
      <Button onPress={submit}>{t("Submit")}</Button>
    </SafeAreaView>
  );
}

export default function NewAutomation() {
  const { settings, t } = useSettings();
  const Stack = createNativeStackNavigator();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [services, setServices] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      const data = await getServices(settings.apiBaseUrl);
      setServices(data);
    };

    fetchServices();
  }, []);

  return (
    services &&
    <Stack.Navigator>
      <Stack.Screen name="Triggers1" options={{ title: t("Chose a service for your trigger") }} component={NewAutomation_Triggers1} initialParams={{ serviceData: services }} />
      <Stack.Screen name="Triggers2" options={{ title: t("Chose a trigger") }} component={NewAutomation_Triggers2} initialParams={{ serviceData: services }} />
      <Stack.Screen name="Reactions1" options={{ title: t("Chose a service for your reaction") }} component={NewAutomation_Reactions1} initialParams={{ serviceData: services }} />
      <Stack.Screen name="Reactions2" options={{ title: t("Chose a reaction") }} component={NewAutomation_Reactions2} initialParams={{ serviceData: services }} />
      <Stack.Screen name="Submit" options={{ title: t("Submit") }} component={NewAutomation_Submit} initialParams={{ serviceData: services }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    alignItems: "center",
  },

  card: {
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
    marginLeft: "2%",
    width: "96%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },

  cardService: {
    flexDirection: "row",
    padding: 10,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  arrow: {
    width: 100,
    height: 100,
    marginVertical: 20,
  },

  infoContainer: {
    marginLeft: 10,
    flex: 1,
  },

  header: {
    padding: 20,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  content: {
    padding: 10,
    fontSize: 15,
  },
});
