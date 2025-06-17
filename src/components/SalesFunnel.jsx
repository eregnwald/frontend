import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDealStore } from '../store/useDealStore';
import { SketchPicker } from 'react-color'; 


export const SalesFunnel = ({
  funnelData,
  onMove,
  mode = 'view',
  onRemoveStage,
}) => {
  const navigate = useNavigate();

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (mode === 'settings') {
      const items = Array.from(funnelData);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      const updatedItems = items.map((item, index) => ({
        ...item,
        position: index + 1,
      }));

      useDealStore.getState().updateFunnelStages(updatedItems);

      const funnelId = funnelData[0]?.funnel_id;
      if (funnelId) {
        useDealStore.getState().saveStageChanges(funnelId, updatedItems);
      }
    } else {
      if (source.droppableId !== destination.droppableId) {
        const sourceStageId = parseInt(source.droppableId, 10);
        const destStageId = parseInt(destination.droppableId, 10);
        const sourceStage = funnelData.find(stage => stage.stage_id === sourceStageId);
        const destinationStage = funnelData.find(stage => stage.stage_id === destStageId);

        if (!sourceStage || !destinationStage) return;

        const opportunity = sourceStage.deals[source.index];
        if (!opportunity) return;

        const isClosed = Boolean(destinationStage.is_closed);
        const isWon = Boolean(destinationStage.is_won);

        onMove(opportunity.opportunity_id, destStageId);
      }
    }
  };

  function getDealWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'сделка';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'сделки';
    return 'сделок';
  }

  if (mode === 'settings') {
    return (
      <Box display="flex" gap={2} overflow="auto" sx={{ py: 2, minHeight: '300px' }}>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="stages" direction="horizontal">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                display="flex"
                gap={2}
                overflow="auto"
              >
                {funnelData.map((stage, index) => (
                  <Draggable key={stage.stage_id} draggableId={`${stage.stage_id}`} index={index}>
                    {(provided, snapshot) => {
                     
                      const currentColor = stage.color || '#007bff';

                      return (
                        <Paper
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          elevation={snapshot.isDraggingOver ? 4 : 2}
                          sx={{
                            minWidth: 250,
                            height: '280px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            padding: 2,
                            background: snapshot.isDraggingOver ? '#f5f5f5' : '#fff',
                            borderRadius: 2,
                          }}
                        >
                          <Box mb={1} textAlign="center" height = "70px">
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              sx={{
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                pointerEvents: 'none',
                              }}
                              title={stage.stage_name}
                            >
                              {stage.stage_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" mt={0.5}>
                              Этап #{stage.position}
                            </Typography>
                           
                            <Box
                              sx={{
                                height: '4px',
                                width: '100%',
                                backgroundColor: currentColor,
                                marginTop: '8px'
                              }}
                            />
                          </Box>

                          <TextField
                            label="Название"
                            value={stage.stage_name}
                            fullWidth
                            size="small"
                            onChange={(e) => {
                              const newName = e.target.value;
                              const updatedFunnel = funnelData.map((s) =>
                                s.stage_id === stage.stage_id ? { ...s, stage_name: newName } : s
                              );
                              useDealStore.getState().updateFunnelStages(updatedFunnel);
                            }}
                          />
                          {!((stage.is_closed && stage.is_won) || (stage.is_closed && !stage.is_won)) && (
                            <IconButton
                              aria-label="delete"
                              color="error"
                              onClick={() => onRemoveStage(stage.stage_id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}

                          {provided.placeholder}
                        </Paper>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    );
  }

  return (
    <Box display="flex" gap={2} overflow="visible" sx={{
      width: 'fit-content'
    }}>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        {funnelData.map((stage) => {
          const totalAmount = stage.deals.reduce(
            (sum, deal) => sum + Number(deal.amount || 0),
            0
          );

          const stageColor = stage.color || '#007bff';

          return (
            <Droppable key={stage.stage_id} droppableId={`${stage.stage_id}`}>
              {(provided, snapshot) => (
                <Paper
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  elevation={snapshot.isDraggingOver ? 4 : 2}
                  sx={{
                    minWidth: 250,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    padding: 2,
                    background: snapshot.isDraggingOver ? '#f5f5f5' : '#fff',
                    borderRadius: 2,
                  }}
                >
                  <Box minHeight={70} textAlign="center">
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        pointerEvents: 'none',
                      }}
                      title={stage.stage_name}
                    >
                      {stage.stage_name}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary" mt={0.5}>
                      {stage.deals.length} {getDealWord(stage.deals.length)} · {totalAmount.toLocaleString()} ₽
                    </Typography>
                    <Box
                      sx={{
                        height: '4px',
                        width: '100%',
                        backgroundColor: stageColor,
                        marginTop: '8px'
                      }}
                    />
                  </Box>

                  <Box mt={2} flexGrow={1} overflow="auto">
                    {stage.deals.map((deal, index) => (
                      <Draggable
                        key={deal.opportunity_id}
                        draggableId={`deal-${deal.opportunity_id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              padding: '8px 12px',
                              marginBottom: '8px',
                              backgroundColor: snapshot.isDragging ? '#e0e0e0' : '#f9f9f9',
                              borderRadius: 2,
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: '#e0e0e0'
                              }
                            }}
                            onClick={() => navigate(`/deal/${deal.opportunity_id}`)}
                          >
                            <Typography variant="body1" fontWeight={500}>
                              {deal.opportunity_name}
                            </Typography>

                            {(deal.account || deal.contact) && (
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                {deal.account?.account_name}
                                {deal.account && deal.contact && ', '}
                                {deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : null}
                              </Typography>
                            )}

                            <Typography variant="body2" color="textSecondary">
                              {Number(deal.amount).toLocaleString()} ₽
                            </Typography>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                </Paper>
              )}
            </Droppable>
          );
        })}
      </DragDropContext>
    </Box>
  );
};