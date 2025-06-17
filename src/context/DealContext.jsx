import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchFunnelData, updateDealStage } from '../services/dealApi';

const DealContext = createContext();

export const DealProvider = ({ children }) => {
  const [funnelData, setFunnelData] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFunnelData();
      setFunnelData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const moveDeal = async (dealId, newStageId) => {
    await updateDealStage(dealId, newStageId);
    const updated = await fetchFunnelData();
    setFunnelData(updated);
  };

  const updateSelectedDeal = async (data) => {
    const updatedDeal = await updateDeal(selectedDeal.opportunity_id, data);
    setSelectedDeal(updatedDeal);
    const updatedFunnel = await fetchFunnelData();
    setFunnelData(updatedFunnel);
  };

  return (
    <DealContext.Provider
      value={{
        funnelData,
        selectedDeal,
        loading,
        setSelectedDeal,
        moveDeal,
        updateSelectedDeal,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};

export const useDealContext = () => useContext(DealContext);