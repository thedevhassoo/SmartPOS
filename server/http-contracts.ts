// REST facade for the public HTTP boundary. Command names remain internal adapters
// so incrementally integrated modules can be discovered without editing the shell.
export type HttpContract = {
    method: 'get' | 'post' | 'patch' | 'put' | 'delete';
    path: string;
    action: string;
    params?: Record<string, string>;
    fixed?: Record<string, unknown>;
};
export const httpContracts: HttpContract[] = [
    {
        method: 'post', path: '/auth/login', action: 'login'
    },
    {
        method: 'get', path: '/auth/me', action: 'me'
    },
    {
        method: 'post', path: '/auth/logout', action: 'logout'
    },
    {
        method: 'get', path: '/users', action: 'staff.list'
    },
    {
        method: 'post', path: '/users', action: 'staff.save'
    },
    {
        method: 'patch', path: '/users/:id', action: 'staff.save', params: { id: 'id' }
    },
    {
        method: 'post', path: '/users/:id/reset-password', action: 'staff.reset', params: { id: 'id' }
    },
    {
        method: 'get', path: '/products/search', action: 'products.lookup'
    },
    {
        method: 'get', path: '/products', action: 'products.list'
    },
    {
        method: 'post', path: '/products', action: 'products.save'
    },
    {
        method: 'patch', path: '/products/:id', action: 'products.save', params: { id: 'id' }
    },
    {
        method: 'get', path: '/inventory', action: 'stock.list'
    },
    {
        method: 'post', path: '/inventory/:product/batches', action: 'stock.receive', params: { product: 'product' }
    },
    {
        method: 'patch', path: '/inventory/batches/:id', action: 'stock.correct', params: { id: 'id' }
    },
    {
        method: 'post', path: '/inventory/:product/adjustments', action: 'stock.adjust', params: { product: 'product' }
    },
    {
        method: 'put', path: '/inventory/:product/threshold', action: 'alerts.threshold', params: { product: 'product' }
    },
    {
        method: 'get', path: '/locations', action: 'locations.list'
    },
    {
        method: 'post', path: '/locations', action: 'locations.save'
    },
    {
        method: 'patch', path: '/locations/:id', action: 'locations.save', params: { id: 'id' }
    },
    {
        method: 'put', path: '/products/:product/location', action: 'locations.assign', params: { product: 'product' }
    },
    {
        method: 'get', path: '/locations/products', action: 'locations.filter'
    },
    {
        method: 'delete', path: '/locations/:id', action: 'locations.delete', params: { id: 'id' }
    },
    {
        method: 'get', path: '/imports', action: 'imports.list'
    },
    {
        method: 'post', path: '/imports', action: 'imports.preview'
    },
    {
        method: 'post', path: '/imports/:job/cancel', action: 'imports.cancel', params: { job: 'job' }
    },
    {
        method: 'put', path: '/imports/:job/duplicates/:row', action: 'imports.choose', params: { job: 'job', row: 'row' }
    },
    {
        method: 'put', path: '/imports/:job/rows/:row/decision', action: 'imports.decide', params: { job: 'job', row: 'row' }
    },
    {
        method: 'post', path: '/imports/:job/confirm', action: 'imports.confirm', params: { job: 'job' }
    },
    {
        method: 'post', path: '/imports/:job/rows/:row/refresh', action: 'imports.refresh', params: { job: 'job', row: 'row' }
    },
    {
        method: 'get', path: '/drafts', action: 'drafts.list'
    },
    {
        method: 'post', path: '/drafts/calculate', action: 'drafts.quote'
    },
    {
        method: 'post', path: '/drafts', action: 'drafts.save'
    },
    {
        method: 'put', path: '/drafts/:id', action: 'drafts.save', params: { id: 'id' }
    },
    {
        method: 'get', path: '/offers', action: 'offers.list'
    },
    {
        method: 'post', path: '/offers', action: 'offers.save'
    },
    {
        method: 'patch', path: '/offers/:id', action: 'offers.save', params: { id: 'id' }
    },
    {
        method: 'post', path: '/offers/:id/cancel', action: 'offers.cancel', params: { id: 'id' }
    },
    {
        method: 'post', path: '/offers/calculate', action: 'offers.calculate'
    },
    {
        method: 'post', path: '/sales/push', action: 'sales.push'
    },
    {
        method: 'get', path: '/sales/:sale/refundable', action: 'refunds.eligibility', params: { sale: 'sale' }
    },
    {
        method: 'get', path: '/sales/:id', action: 'sales.receipt', params: { id: 'id' }
    },
    {
        method: 'get', path: '/transactions', action: 'sales.history'
    },
    {
        method: 'get', path: '/audit', action: 'audit.list'
    },
    {
        method: 'post', path: '/audit/:id/archive', action: 'audit.archive', params: { id: 'id' }
    },
    {
        method: 'get', path: '/refunds', action: 'refunds.list'
    },
    {
        method: 'post', path: '/refunds', action: 'refunds.request'
    },
    {
        method: 'post', path: '/refunds/:id/approve', action: 'refunds.review', params: { id: 'id' }, fixed: { decision: 'Approve' }
    },
    {
        method: 'post', path: '/refunds/:id/reject', action: 'refunds.review', params: { id: 'id' }, fixed: { decision: 'Reject' }
    },
    {
        method: 'post', path: '/refunds/:id/complete', action: 'refunds.complete', params: { id: 'id' }
    },
    {
        method: 'post', path: '/returns/:id/inspect', action: 'returns.inspect', params: { id: 'id' }
    },
    {
        method: 'post', path: '/returns/:id/disposition', action: 'returns.disposition', params: { id: 'id' }
    },
    {
        method: 'get', path: '/reports/sales', action: 'reports.summary'
    },
    {
        method: 'get', path: '/alerts', action: 'alerts.list'
    },
    {
        method: 'get', path: '/insights', action: 'ai.recommendations'
    },
    {
        method: 'post', path: '/insights/:product/accept-threshold', action: 'ai.accept', params: { product: 'product' }
    }
];
