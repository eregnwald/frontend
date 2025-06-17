import { create } from 'zustand';
import axios from 'axios';
import apiClient from '../services/apiClient';
import {
  fetchOpportunitiesByFunnelId,
  getStagesForFunnel,
} from '../services/opportunityApi';
import { jwtDecode } from 'jwt-decode';


export const useDealStore = create((set, get) => ({
  funnel: null,
  funnelData: [],
  funnelStages: [],
  loading: true,

 
  fetchAllData: async (funnelId) => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');

      const [stagesRes, opportunitiesRes, funnelRes] = await Promise.all([
        getStagesForFunnel(funnelId, token),
        fetchOpportunitiesByFunnelId(funnelId, token),
        apiClient.get(`${process.env.REACT_APP_API_URL}/funnels/${funnelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const stages = stagesRes || [];
      const opportunities = opportunitiesRes || [];
      const funnel = funnelRes.data;

      const currentUser = jwtDecode(token);
      const currentUserId = currentUser.sub;
      const isAdmin = currentUser.roles?.includes('manager'); 

      const filteredOpportunities = isAdmin
        ? opportunities
        : opportunities.filter(deal => deal.owner_id === currentUserId);

      const merged = stages.map(stage => {
        const stageDeals = filteredOpportunities.filter(deal => deal.stage_id === stage.stage_id);
        return {
          ...stage,
          deals: stageDeals,
          count: stageDeals.length,
          totalAmount: stageDeals.reduce((sum, d) => sum + d.amount, 0),
        };
      });

      set({
        funnel,
        funnelData: merged,
        funnelStages: stages,
        loading: false,
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error.message);
      set({ loading: false });
    }
  },

  
  fetchSharedFunnel: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен отсутствует');

      const sharedFunnelRes = await apiClient.get(`${process.env.REACT_APP_API_URL}/funnels/shared`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sharedFunnels = sharedFunnelRes.data || [];

      if (sharedFunnels.length === 0) {
        throw new Error('Общая воронка не найдена');
      }

      const sharedFunnel = sharedFunnels[0];

      const [stagesRes, opportunitiesRes] = await Promise.all([
        getStagesForFunnel(sharedFunnel.funnel_id, token),
        fetchOpportunitiesByFunnelId(sharedFunnel.funnel_id, token),
      ]);

      const stages = stagesRes || [];
      const opportunities = opportunitiesRes || [];

      const merged = stages.map(stage => {
        const stageDeals = opportunities.filter(deal => deal.stage_id === stage.stage_id);
        return {
          ...stage,
          deals: stageDeals,
          count: stageDeals.length,
          totalAmount: stageDeals.reduce((sum, d) => sum + d.amount, 0),
        };
      });

      set({
        funnel: sharedFunnel,
        funnelData: merged,
        funnelStages: stages,
        loading: false,
      });

      return sharedFunnel.funnel_id;
    } catch (error) {
      console.error('Ошибка при загрузке общей воронки:', error.message);
      set({ loading: false });
      throw error;
    }
  },

  updateFunnelStages: (updatedStages) => {
    set({ funnelData: updatedStages });
  },

  addStage: async (funnelId, payload) => {
    try {
      const token = localStorage.getItem('token');
      const res = await apiClient.post(
        `${process.env.REACT_APP_API_URL}/funnels/${funnelId}/stages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const newStage = res.data;
      set((state) => ({
        funnelData: [
          ...state.funnelData,
          {
            ...newStage,
            deals: [],
            count: 0,
            totalAmount: 0,
          },
        ],
      }));
    } catch (e) {
      console.error('Ошибка при создании этапа:', e.message);
    }
  },

  moveDeal: async (opportunityId, newStageId, lost_reason = null) => {
    const token = localStorage.getItem('token');
    const currentData = get().funnelData;
    let movedDeal = null;

    const newFunnelData = currentData.map(stage => {
      const deals = stage.deals.filter(deal => {
        if (deal.opportunity_id === opportunityId) {
          movedDeal = { ...deal, stage_id: newStageId };
          return false;
        }
        return true;
      });
      return {
        ...stage,
        deals,
        count: deals.length,
        totalAmount: deals.reduce((sum, d) => sum + d.amount, 0),
      };
    }).map(stage => {
      if (stage.stage_id === newStageId && movedDeal) {
        const updatedDeals = [...stage.deals, movedDeal];
        return {
          ...stage,
          deals: updatedDeals,
          count: updatedDeals.length,
          totalAmount: updatedDeals.reduce((sum, d) => sum + d.amount, 0),
        };
      }
      return stage;
    });

    set({ funnelData: newFunnelData });

    try {
      await apiClient.patch(
        `${process.env.REACT_APP_API_URL}/opportunities/${opportunityId}/stage`,
        {
          stage_id: newStageId,
          ...(lost_reason && { lost_reason })
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.error('Ошибка при перемещении сделки:', e.message);
    }
  },

  updateDealOwner: (opportunity_id, newOwnerId) => {
    set((state) => {
      return {
        funnelData: state.funnelData.map(stage => ({
          ...stage,
          deals: stage.deals.map(d =>
            d.opportunity_id === opportunity_id
              ? { ...d, owner_id: newOwnerId }
              : d
          ),
        })),
      };
    });
  },

  saveStageChanges: async (funnelId, stages) => {
    const token = localStorage.getItem('token');
    const res = await apiClient.patch(
      `${process.env.REACT_APP_API_URL}/funnels/${funnelId}/stages`,
      stages.map(stage => ({
        stage_id: stage.stage_id,
        stage_name: stage.stage_name,
        position: stage.position,
        probability: stage.probability,
        is_closed: stage.is_closed,
      })),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },

  removeStage: async (funnelId, stageIdToDelete) => {
    const token = localStorage.getItem('token');
    const { funnelData } = get();
    const stageToDelete = funnelData.find(stage => stage.stage_id === stageIdToDelete);
    if (!stageToDelete) return;

    let updatedData = [...funnelData];

    if (stageToDelete.deals.length > 0) {
      let unresolvedStage = updatedData.find(stage => stage.stage_name === 'Неразобранное');
      if (!unresolvedStage) {
        try {
          const res = await apiClient.post(
            `${process.env.REACT_APP_API_URL}/funnels/${funnelId}/stages`,
            {
              stage_name: 'Неразобранное',
              position: updatedData.length + 1,
              is_closed: false,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          unresolvedStage = {
            ...res.data,
            deals: [],
            count: 0,
            totalAmount: 0,
          };
          updatedData.push(unresolvedStage);
        } catch (e) {
          console.error('Ошибка при создании этапа "Неразобранное":', e.message);
          return;
        }
      }

      updatedData = updatedData.map(stage => {
        if (stage.stage_id === unresolvedStage.stage_id) {
          return {
            ...stage,
            deals: [...stage.deals, ...stageToDelete.deals],
            count: stage.deals.length + stageToDelete.deals.length,
            totalAmount: stage.totalAmount + stageToDelete.totalAmount,
          };
        }
        if (stage.stage_id === stageIdToDelete) {
          return {
            ...stage,
            deals: [],
            count: 0,
            totalAmount: 0,
          };
        }
        return stage;
      });
    }

    updatedData = updatedData.filter(stage => stage.stage_id !== stageIdToDelete);
    set({ funnelData: updatedData });

    try {
      await apiClient.delete(`${process.env.REACT_APP_API_URL}/funnels/${funnelId}/stages/${stageIdToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await apiClient.patch(
        `${process.env.REACT_APP_API_URL}/funnels/${funnelId}/stages`,
        updatedData.map((stage, index) => ({
          stage_id: stage.stage_id,
          position: index + 1,
        })),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.error('Ошибка при удалении этапа:', e.message);
    }
  },

  saveStagePositions: async (funnelId, stages) => {
    const token = localStorage.getItem('token');
    const res = await apiClient.patch(
      `${process.env.REACT_APP_API_URL}/funnels/${funnelId}/stages`,
      stages.map(stage => ({
        stage_id: stage.stage_id,
        position: stage.position,
      })),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },
}));