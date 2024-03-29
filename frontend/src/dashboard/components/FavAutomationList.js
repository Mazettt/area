import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useAuth } from '../../AuthContext';
import { useSettings } from '../../SettingsContext';
import { useTheme } from '../../themeContext';
import EditModalAutomations from './EditModalAutomations';

function createData(id, trigger, reaction, type, status, imageSrcTrigger, imageSrcReaction, name, favorite) {
    return { id, trigger, reaction, type, status, imageSrcTrigger, imageSrcReaction, name, favorite };
}

const rows = [
    createData(''),
];

export default function FavAutomations() {
    const { mainTheme } = useTheme();
    const { t } = useSettings();
    const [tableData, setTableData] = useState(rows);
    const [automation, setAutomation] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
    const { getAllServices, getAutomationsByFav} = useAuth();

    useEffect(() => {
        const getAllAutomations = async () => {
            try {
                const result = await getAllServices();
                const userAutomations = await getAutomationsByFav();

                const automationsMap = {};

                userAutomations.forEach(automation => {
                    const triggerService = result.find(service => service.id === automation.trigger_service_id);
                    const reactionService = result.find(service => service.id === automation.reaction_service_id);

                    const trigger = triggerService.triggers.find(trigger => trigger.id === automation.trigger_id)?.name || 'Unknown Trigger';
                    const reaction = reactionService.reactions.find(reaction => reaction.id === automation.reaction_id)?.name || 'Unknown Reaction';

                    const automationData = createData(
                        automation.id,
                        trigger,
                        reaction,
                        'Automation',
                        automation.active,
                        triggerService.icon,
                        reactionService.icon,
                        automation.automation_name,
                        automation.favorite,
                        );
                    automationsMap[automation.id] = automationData;
                });
                const newData = Object.values(automationsMap);
                setTableData(newData);
            } catch (error) {
                console.error('Error fetching automations:', error);
            }
        };
        getAllAutomations();
    }, [getAllServices, getAutomationsByFav]);

    const closeModal = () => {
        setOpenEditModal(false);
    };

    const updateAutomation = (updatedAutomationData) => {
        if (updatedAutomationData && updatedAutomationData.id) {
            setTableData((prevTableData) =>
                prevTableData.map((row) =>
                    row.id === updatedAutomationData.id
                    ? { ...row, name: updatedAutomationData.automation_name }
                    : row
                )
            );
        } else {
            console.error('Invalid data format for updating automation.');
        }
    };

    const handleRenderStatus = (status) => {
        if (status == 1)
            return t("Active");
        else
            return t("Inactive");
    }

    TableCell.defaultProps = {
        style: { fontSize: '1.2rem', color: mainTheme.palette.SwitchStyle.main }
    };

    let TableCellChildrends = {
        style: { fontSize: '1rem', color: mainTheme.palette.TextStyle1.main}
    }

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{t("Automations name")}</TableCell>
                        <TableCell>{t("Trigger")}</TableCell>
                        <TableCell>{t("Reaction")}</TableCell>
                        <TableCell>{t("Status")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableData.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell {...TableCellChildrends}>{row.name}</TableCell>
                            <TableCell {...TableCellChildrends}>
                                {<img
                                  src={process.env.REACT_APP_API_URL + row.imageSrcTrigger}
                                  alt="Logo"
                                  height="32"
                                  width="32"
                                  style={{ verticalAlign: 'middle', marginRight: '8px' }}
                                />
                                }
                                {row.trigger}
                            </TableCell>
                            <TableCell {...TableCellChildrends}>
                                {<img
                                  src={process.env.REACT_APP_API_URL + row.imageSrcReaction}
                                  alt="Logo"
                                  height="32"
                                  width="32"
                                  style={{ verticalAlign: 'middle', marginRight: '8px' }}
                                />
                                }
                                {row.reaction}
                            </TableCell>
                            <TableCell {...TableCellChildrends}>{handleRenderStatus(row.status)}</TableCell>
                            <TableCell {...TableCellChildrends}>
                            </TableCell>
                        </TableRow>
                    ))}
                    <EditModalAutomations isOpen={openEditModal} closeModal={closeModal} selectedAutomation={automation} onUpdateAutomation={updateAutomation} />
                </TableBody>
            </Table>
            <div style={{ height: '100px' }}></div>
        </TableContainer>
    );
}