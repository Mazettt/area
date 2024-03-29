import fs from 'fs';
import servicesRouter from './routes/service.js';
import automationsRouter from './routes/automations.js';

import { db, t } from './global.js';

class ServiceManager {
    constructor(app) {
        this.app = app;

        this.app.use('/service', servicesRouter);
        this.app.use('/automations', automationsRouter);

        this.services = [];
        this.serviceObject = [];
        this.importServices();

        this.intervalId = setInterval(() => this.checkTriggers(), 10000);
    }

    async importServices() {
        const files = fs.readdirSync('src/services');
        files.forEach(async element => {
            if (element.startsWith('_'))
                return;
            console.log(`Loading file ${element}...`);
            const service = await import(`./services/${element}`);
            this.registerService(service);
        });
    }

    registerService(service) {
        this.services.push(service);
        this.app.use(`/service/oauth/${service.id}`, service.router);
    }

    getServices() {
        return this.services;
    }

    getServicesTranslated(lang) {
        const replacer = (key, value) => {
            if (typeof value === 'string' && (key === 'name' || key === 'description'))
                return t.t(lang, value);
            return value;
        };
        return JSON.parse(JSON.stringify(this.services, replacer));
    }

    generateServiceObject() {
        const serviceData = this.services;
        const serviceObject = serviceData.map(service => {
            const { name, reactions, triggers } = service;

            const serviceObject = {
                name: name,
                actions: reactions.map(reaction => ({
                    name: reaction.name,
                    description: reaction.description,
                })),
                reactions: triggers.map(trigger => ({
                    name: trigger.name,
                    description: trigger.description,
                })),
            };
            return serviceObject;
        });
        this.serviceObject = serviceObject;
    }

    getServiceObject() {
        if (!this.serviceObject || !this.serviceObject.length) this.generateServiceObject();
        return this.serviceObject;
    }

    getService(id) {
        return this.services.find((service) => service.id === id);
    }

    getServiceTranslated(lang, id) {
        const replacer = (key, value) => {
            if (typeof value === 'string' && (key === 'name' || key === 'description'))
                return t.t(lang, value);
            return value;
        };
        const service = this.getService(id);
        if (!service) return undefined;
        return JSON.parse(JSON.stringify(this.getService(id), replacer));
    }

    getTrigger(serviceId, id) {
        return this.getService(serviceId).triggers.find((trigger) => trigger.id === id);
    }

    getReaction(serviceId, id) {
        return this.getService(serviceId).reactions.find((reaction) => reaction.id === id);
    }

    async checkTriggers() {
        try {
            const users = await db.getAllUsers();
            users.forEach(async (user) => {
                const automations = await db.getAutomations(user.id);
                automations.forEach(async (automation) => {
                    try {
                        if (automation.active != 0) {
                            const triggerServiceToken = (await db.getServiceOauth(user.id, automation.trigger_service_id))[0].token;
                            const triggerServiceData = await this.getTrigger(automation.trigger_service_id, automation.trigger_id);
                            const triggerServiceCheck = await triggerServiceData.check(automation.id, user, JSON.parse(automation.trigger_params), JSON.parse(automation.trigger_check_data), triggerServiceToken);

                            if (triggerServiceCheck) {
                                console.log(triggerServiceCheck.text);
                                const reactionServiceToken = (await db.getServiceOauth(user.id, automation.reaction_service_id))[0].token;
                                await this.getReaction(automation.reaction_service_id, automation.reaction_id).execute(user, JSON.parse(automation.reaction_params), reactionServiceToken, triggerServiceCheck);
                            }
                        } else
                            return;
                    } catch (error) {
                        console.error(error);
                    }
                });
            });
        } catch (error) {
            console.error(error);
        }
    }
}

export default ServiceManager;
