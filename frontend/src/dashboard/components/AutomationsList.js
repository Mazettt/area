import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../AuthContext';
import { useSettings } from '../../SettingsContext';
import EditModalAutomations from './EditModalAutomations';
import { useTheme } from '../../themeContext';
import GradeIcon from '@mui/icons-material/Grade';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';

function createData(id, trigger, reaction, type, status, imageSrcTrigger, imageSrcReaction, name, favorite) {
    return { id, trigger, reaction, type, status, imageSrcTrigger, imageSrcReaction, name, favorite };
}

const rows = [
    createData(''),
];

export default function ServicesDash() {
    const { t } = useSettings();
    const [tableData, setTableData] = useState(rows);
    const [automation, setAutomation] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
    const { mainTheme } = useTheme();
    const { getAllServices, getAutomations, deleteAutomation, getAutomationsById, updateFavById, updateActiveById } = useAuth();

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

    const handleFavAutomation = async (id, fav) => {
        try {
            await updateFavById(id, fav);
            const updateFav = ((prevTableData) => prevTableData.map((row) =>
                row.id === id ? { ...row, favorite: fav, } : row
            ));
            setTableData(updateFav);
        } catch (error) {
            console.error('fav automation failed:', error);
        }
    };

    const handleStartAutomation = async (id, status) => {
        try {
            await updateActiveById(id, status);
            const updateActive = ((prevTableData) => prevTableData.map((row) =>
                row.id === id ? { ...row, status: status } : row
            ));
            setTableData(updateActive);
        } catch (error) {
            console.error('active automation failed:', error);
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

    const handleRenderStatus = (status) => {
        if (status === 1 || status === true)
            return t("Active");
        else
            return t("Inactive");
    }

    TableCell.defaultProps = {
        style: { fontSize: '1.2rem', color: '#4B4E6D' }
    };

    let TableCellChildrends = {
        style: { color: mainTheme.palette.TextField1.main, fontSize: '1rem'}
    }

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell style={{color: mainTheme.palette.TextField1.main}}>{t("Automations name")}</TableCell>
                        <TableCell style={{color: mainTheme.palette.TextField1.main}}>{t("Trigger")}</TableCell>
                        <TableCell style={{color: mainTheme.palette.TextField1.main}}>{t("Reaction")}</TableCell>
                        <TableCell style={{color: mainTheme.palette.TextField1.main}}>{t("Status")}</TableCell>
                        <TableCell style={{color: mainTheme.palette.TextField1.main}}>{t("Actions")}</TableCell>
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
                                  style={{color: mainTheme.palette.TextField1.main, verticalAlign: 'middle', marginRight: '8px' }}
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
                                <IconButton onClick={() => handleStartAutomation(row.id, !row.status)} style={{ color: mainTheme.palette.TextField1.main }} aria-label="play">
                                    {row.status ? (
                                        <StopCircleOutlinedIcon />
                                    ) : (
                                        <PlayCircleOutlineIcon />
                                    )}
                                </IconButton>
                                <IconButton
                                    onClick={() => handleFavAutomation(row.id, !row.favorite)}
                                    style={{ color: mainTheme.palette.TextField1.main }}
                                    aria-label="favorite"
                                >
                                    {row.favorite ? (
                                        <GradeIcon />
                                    ) : (
                                        <GradeOutlinedIcon />
                                    )}
                                </IconButton>
                                <IconButton onClick={() => handleOpenEditModal(row.id)} style={{ color: mainTheme.palette.TextField1.main }} aria-label="edit">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteAutomation(row.id)} style={{ color: mainTheme.palette.TextField1.main }} aria-label="delete">
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