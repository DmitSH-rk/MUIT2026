import api from './axiosInstance';

export const fundingApi = {
  // Получить список всех кампаний
  getCampaigns: async (params = {}) => {
    const response = await api.get('/funding/campaigns/', { params });
    return response.data;
  },

  // Создать новую кампанию (доступно только клубам)
  createCampaign: async (campaignData) => {
    const response = await api.post('/funding/campaigns/', campaignData);
    return response.data;
  },

  // Сделать инвестицию/пожертвование
  // createInvestment: async (investmentData) => {
  //   // investmentData: { campaign_id, amount, type }
  //   const response = await api.post('/funding/investments', investmentData);
  //   return response.data;
  // },
  createInvestment: async (data) => {
    // ВАЖНО: проверяем отсутствие лишнего слэша, если бэк ругается на 422
    const response = await api.post('/funding/investments', {
      campaign_id: Number(data.campaign_id),
      amount: Number(data.amount),
      type: data.type
    });
    return response.data;
  },
uploadCampaignCover: async (campaignId, file) => {
  const form = new FormData();
  form.append('cover', file);

  const res = await api.post(`/funding/campaigns/${campaignId}/cover`, form, {
    headers: { 'accept': 'application/json' },
  });

  return res.data;
},
  getCampaignById: async (id) => {
    const response = await api.get(`/funding/campaigns/${id}`);
    return response.data;
  },

  initiatePayment: async (data) => {
    const response = await api.post('/payments/initiate', {
      investment_id: Number(data.investment_id),
      provider: data.provider || "paybox"
    });
    return response.data;
  },

  simulatePaymentWebhook: async (paymentId) => {
    const response = await api.post('/payments/webhook/simulate', {
      // Для симуляции обычно используем внутренний ID платежа как ID провайдера
      provider_payment_id: String(paymentId),
      provider_event_id: "sim_event_" + Date.now(),
      event_type: "payment_status",
      status: "recieved", // Статус, который переведет платеж в 'success'
      signature: "dev_mode",
      payload: {}
    });
    return response.data;
  },

  // Получить свои инвестиции
  getMyInvestments: async () => {
    const response = await api.get('/funding/investments/my/');
    return response.data;
  }

};