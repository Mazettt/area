import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'; // Import dayjs library

import { useSettings } from '../../SettingsContext';

const ModalSettingsService = ({ isOpen, closeModal, data, onSubmit }) => {
    const { t } = useSettings();
    const [formValues, setFormValues] = useState({});
    const [isFormInvalid, setIsFormInvalid] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
        setIsFormInvalid(false);
    };

    const renderFormField = (field) => {
        if (field.type === 'text') {
            return (
                <TextField
                    fullWidth
                    label={field.name}
                    variant="outlined"
                    name={field.id}
                    onChange={handleChange}
                    helperText={field.description}
                />
            );
        } else if (field.type === 'date') {
            return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label={field.name}
                        value={formValues[field.id] || null}
                        onChange={(newValue) => {
                            const formattedDate = dayjs(newValue).toISOString();
                            setFormValues((prevValues) => ({
                                ...prevValues,
                                [field.id]: formattedDate,
                            }));
                        }}
                        renderInput={(params) => <TextField {...params} variant="outlined" />}
                        helperText={field.description}
                    />
                </LocalizationProvider>
            );
        }

        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formValuesSize = Object.keys(formValues).length;
        const expectedFieldsLength = (data?.fields).length;

        if (formValuesSize !== expectedFieldsLength) {
            setIsFormInvalid(true);
            return;
        }

        setIsFormInvalid(false);
        data['formValues'] = formValues;
        onSubmit(data);
        closeModal();
    };

    useEffect(() => {
        if (isOpen) {
            setFormValues({});
            setIsFormInvalid(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onClose={closeModal}>
            <DialogTitle sx={{ textAlign: 'center' }}>{t("Parameters")}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    {data?.fields && data.fields.map((field) => (
                        <div key={field.id} style={{ marginBottom: '1.5rem' }}>
                            {renderFormField(field)}
                        </div>
                    ))}
                    {isFormInvalid && (
                        <div style={{ color: 'red', marginTop: '10px' }}>
                            {t("Please fill in all the fields")}
                        </div>
                    )}
                </form>
            </DialogContent>
            <DialogActions style={{ justifyContent: 'space-between', marginLeft: '20px', marginRight: '20px', marginTop: '-1.5rem' }}>
                <Button onClick={closeModal} color="primary">
                    {t("Cancel")}
                </Button>
                <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                    {t("Submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalSettingsService;
