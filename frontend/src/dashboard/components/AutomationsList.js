import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { PauseCircleOutline } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../AuthContext';
import { useSettings } from '../../SettingsContext';
import EditModalAutomations from './EditModalAutomations';

function createData(id, trigger, reaction, type, status, imageSrcTrigger, imageSrcReaction, name) {
    return { id, trigger, reaction, type, status, imageSrcTrigger, imageSrcReaction, name };
}

const rows = [
    createData(''),
];

export default function ServicesDash() {
    const { t } = useSettings();
    const [tableData, setTableData] = useState(rows);
    const [automation, setAutomation] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
    const { getAllServices, getAutomations, deleteAutomation, getAutomationsById } = useAuth();

    useEffect(() => {
        const getAllAutomations = async () => {
            try {
                const result = await getAllServices();
                const userAutomations = await getAutomations();

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
                        'Status',
                        triggerService.icon,
                        reactionService.icon,
                        automation.automation_name
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
    }, [getAllServices, getAutomations]);

    const handleOpenEditModal = (row) => {
        const getAutomation = async () => {
            try {
                const result = await getAutomationsById(row);
                setAutomation(result);
            } catch (error) {
                console.error('Error fetching automation by id:', error);
            }
        }
        getAutomation();
        setOpenEditModal(true);
    };

    const closeModal = () => {
        setOpenEditModal(false);
    };

    const handleDeleteAutomation = async (id) => {
        try {
            await deleteAutomation(id);
            const updatedTableData = tableData.filter(row => row.id !== id);
            setTableData(updatedTableData);
        } catch (error) {
            console.error('delete automation failed:', error);
        }
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

    TableCell.defaultProps = {
        style: { fontSize: '1.2rem', color: '#4B4E6D' }
    };

    let TableCellChildrends = {
        style: { fontSize: '1rem', color: 'black' }
    }

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{t("ID")}</TableCell>
                        <TableCell>Automations name</TableCell>
                        <TableCell>{t("Trigger")}</TableCell>
                        <TableCell>{t("Reaction")}</TableCell>
                        <TableCell>{t("Status")}</TableCell>
                        <TableCell>{t("Actions")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: '#222222' }}>
                    {tableData.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell {...TableCellChildrends}>{row.id}</TableCell>
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
                            <TableCell {...TableCellChildrends}>{row.status}</TableCell>
                            <TableCell {...TableCellChildrends}>
                                <IconButton style={{ color: TableCell.defaultProps.style.color }} aria-label="play">
                                    <PlayCircleOutlineIcon />
                                </IconButton>
                                <IconButton onClick={() => handleOpenEditModal(row.id)} style={{ color: TableCell.defaultProps.style.color }} aria-label="edit">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteAutomation(row.id)} style={{ color: TableCell.defaultProps.style.color }} aria-label="delete">
                                    <DeleteIcon />
                                </IconButton>
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