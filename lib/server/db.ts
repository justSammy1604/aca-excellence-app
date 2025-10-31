import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  // keep default options; this file is used server-side in Next API routes
});

// Minimal adapter to match the Prisma usage in API routes. Each property returns
// an object with the methods the routes expect (findMany, findUnique, upsert, create, delete).
export const prisma: any = {
  student: {
    async findMany(_opts?: any) {
      const { data, error } = await supabase.from('students').select('id, displayname');
      if (error) throw error;
      return (data || []).map((r: any) => ({ ...r, displayName: r.displayname }));
    },
    async findUnique(opts: any) {
      const id = opts?.where?.id;
      if (!id) return null;
      const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
      if (error) return null;
      return { ...data, displayName: data.displayname };
    }
    ,
    async update(params: any) {
      const where = params?.where;
      const data = params?.data;
      const id = where?.id;
      if (!id) throw new Error('missing id');
      const payload: any = {};
      if (data.displayName !== undefined) payload.displayname = data.displayName;
      if (data.email !== undefined) payload.email = data.email;
      const { data: d, error } = await supabase.from('students').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return { ...d, displayName: d.displayname };
    }
    ,
    async create({ data }: { data: any }) {
      const payload: any = { id: data.id };
      if (data.displayname !== undefined) payload.displayname = data.displayname;
      if (data.displayName !== undefined) payload.displayname = data.displayName;
      if (data.password !== undefined) payload.password = data.password;
      if (data.email !== undefined) payload.email = data.email;
      const { data: d, error } = await supabase.from('students').insert([payload]).select().single();
      if (error) throw error;
      return { ...d, displayName: d.displayname };
    }
  },
  resource: {
    async findMany(opts?: any) {
      const select = (opts && opts.select) ? Object.keys(opts.select).join(',') : '*';
      const { data, error } = await supabase.from('resources').select(select);
      if (error) throw error;
      return data || [];
    },
    async findUnique({ where }: { where: { title?: string } }) {
      if (where.title) {
        const { data, error } = await supabase.from('resources').select('*').eq('title', where.title).single();
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data;
      }
      return null;
    },
    async create({ data }: { data: { title: string; url?: string } }) {
      const payload: any = { title: data.title };
      if (data.url !== undefined) payload.url = data.url;
      const { data: d, error } = await supabase.from('resources').insert([payload]).select().single();
      if (error) throw error;
      return d;
    }
  },
  nudge: {
    async findMany(opts?: any) {
      const select = (opts && opts.select) ? Object.keys(opts.select).join(',') : '*';
      const { data, error } = await supabase.from('nudges').select(select);
      if (error) throw error;
      return data || [];
    }
  },
  favorite: {
    async findMany({ where }: { where: { studentId: string } }) {
      // Fetch favorites and then fetch resources explicitly to avoid relying on PostgREST relation naming
      const { data: favs, error: favErr } = await supabase.from('favorites').select('*').eq('studentid', where.studentId);
      if (favErr) throw favErr;
      if (!favs || favs.length === 0) return [];
      const ids = favs.map((f: any) => f.resourceid || f.resourceId).filter(Boolean);
      const { data: resources, error: resErr } = await supabase.from('resources').select('*').in('id', ids);
      if (resErr) throw resErr;
      return favs.map((f: any) => ({ resource: resources.find((r: any) => r.id === (f.resourceid || f.resourceId)) }));
    },
    async create({ data }: { data: { studentId: string; resourceId: string } }) {
      const payload = { studentid: data.studentId, resourceid: data.resourceId };
      const { data: d, error } = await supabase.from('favorites').insert([payload]).select().single();
      if (error) throw error;
      return d;
    },
    async delete({ where }: { where: { studentId_resourceId: { studentId: string; resourceId: string } } }) {
      const { studentId, resourceId } = where.studentId_resourceId;
      const { data, error } = await supabase.from('favorites').delete().match({ studentid: studentId, resourceid: resourceId }).select().single();
      if (error) throw error;
      return data;
    }
  },
  resourceView: {
    async findMany({ where, orderBy }: any) {
      const { data: views, error: viewErr } = await supabase.from('resource_views').select('*').eq('studentid', where.studentId).order('viewedat', { ascending: true });
      if (viewErr) throw viewErr;
      if (!views || views.length === 0) return [];
      const ids = views.map((v: any) => v.resourceid || v.resourceId).filter(Boolean);
      const { data: resources, error: resErr } = await supabase.from('resources').select('*').in('id', ids);
      if (resErr) throw resErr;
      return views.map((v: any) => ({ resource: resources.find((r: any) => r.id === (v.resourceid || v.resourceId)), viewedAt: v.viewedat || v.viewedAt }));
    },
    async create({ data }: { data: { studentId: string; resourceId: string } }) {
      const row = { studentid: data.studentId, resourceid: data.resourceId, viewedat: new Date().toISOString() };
      const { data: d, error } = await supabase.from('resource_views').insert([row]).select().single();
      if (error) throw error;
      return d;
    }
  },
  resourceVote: {
    async findMany({ where }: { where: { studentId: string } }) {
      const { data: votes, error: votesErr } = await supabase.from('resource_votes').select('*').eq('studentid', where.studentId);
      if (votesErr) throw votesErr;
      if (!votes || votes.length === 0) return [];
      const ids = votes.map((v: any) => v.resourceid || v.resourceId).filter(Boolean);
      const { data: resources, error: resErr } = await supabase.from('resources').select('*').in('id', ids);
      if (resErr) throw resErr;
      return votes.map((v: any) => ({ resource: resources.find((r: any) => r.id === (v.resourceid || v.resourceId)), value: v.value }));
    },
    async findUnique({ where }: { where: { studentId_resourceId: { studentId: string; resourceId: string } } }) {
      const { studentId, resourceId } = where.studentId_resourceId;
      const { data, error } = await supabase.from('resource_votes').select('*').match({ studentId, resourceId }).single();
      if (error && error.code === 'PGRST116') return null;
      if (error) throw error;
      return data;
    },
    async upsert({ where, update, create }: any) {
      // Try update first
      const { studentId, resourceId } = where.studentId_resourceId;
      const { data: existing } = await supabase.from('resource_votes').select('*').match({ studentid: studentId, resourceid: resourceId }).maybeSingle();
      if (existing) {
        const { data: d, error } = await supabase.from('resource_votes').update(update).match({ studentid: studentId, resourceid: resourceId }).select().single();
        if (error) throw error;
        return d;
      } else {
        const payload = { studentid: studentId, resourceid: resourceId, ...(create || {}) };
        const { data: d, error } = await supabase.from('resource_votes').insert([payload]).select().single();
        if (error) throw error;
        return d;
      }
    }
  },
  nudgeState: {
    async findMany({ where }: { where: { studentId: string } }) {
      const { data, error } = await supabase.from('nudge_states').select('*').eq('studentid', where.studentId);
      if (error) throw error;
      return data || [];
    },
    async upsert({ where, update, create }: any) {
      const { studentId, nudgeId } = where.studentId_nudgeId;
      const { data: existing } = await supabase.from('nudge_states').select('*').match({ studentid: studentId, nudgeid: nudgeId }).maybeSingle();
      if (existing) {
        const { data: d, error } = await supabase.from('nudge_states').update(update).match({ studentid: studentId, nudgeid: nudgeId }).select().single();
        if (error) throw error;
        return d;
      } else {
        const payload = { studentid: studentId, nudgeid: nudgeId, ...(create || {}) };
        const { data: d, error } = await supabase.from('nudge_states').insert([payload]).select().single();
        if (error) throw error;
        return d;
      }
    }
  }
};

export default supabase;
