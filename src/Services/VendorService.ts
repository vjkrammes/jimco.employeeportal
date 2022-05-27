import { http, HttpResponse } from './http';
import { IVendor } from '../Interfaces/IVendor';
import { IApiResponse } from '../Interfaces/IApiResponse';

export async function getVendors(): Promise<IVendor[]> {
  const result = await http<IVendor[]>({
    path: '/Vendor',
  });
  if (result && result.body) {
    return result.body;
  }
  return [];
}

export async function pageVendors(
  pageno: number,
  pagesize: number,
): Promise<IVendor[]> {
  if (pageno <= 0) {
    pageno = 1;
  }
  if (pagesize <= 0) {
    pagesize = 5;
  }
  if (pagesize > 10) {
    pagesize = 10;
  }
  const result = await http<IVendor[]>({
    path: `/Vendor/${pageno}/${pagesize}`,
  });
  if (result.ok && result.body) {
    return result.body;
  }
  return [];
}

export async function getVendorById(id: string): Promise<IVendor | null> {
  if (!id) {
    return null;
  }
  const result = await http<IVendor | null>({
    path: `/Vendor/ById/${id}`,
  });
  if (result && result.body) {
    return result.body;
  }
  return null;
}

export async function getVendorByName(name: string): Promise<IVendor | null> {
  if (!name) {
    return null;
  }
  const result = await http<IVendor | null>({
    path: `/Vendor/ByName/${name}`,
  });
  if (result && result.body) {
    return result.body;
  }
  return null;
}

export async function createVendor(
  vendor: IVendor,
  addRole: boolean,
  token: string,
): Promise<HttpResponse<IVendor | IApiResponse>> {
  const result = await http<IVendor | IApiResponse, IVendor>({
    path: `/Vendor/Create/${addRole ? 'true' : 'false'}`,
    method: 'post',
    body: vendor,
    token: token,
  });
  return result;
}

export async function updateVendor(
  vendor: IVendor,
  toggleRole: boolean,
  token: string,
): Promise<HttpResponse<IVendor | IApiResponse>> {
  const result = await http<IVendor | IApiResponse, IVendor>({
    path: `/Vendor/Update/${toggleRole ? 'true' : 'false'}`,
    method: 'put',
    body: vendor,
    token: token,
  });
  return result;
}

export async function deleteVendor(
  vendor: IVendor,
  token: string,
): Promise<IApiResponse> {
  const result = await http<IApiResponse>({
    path: `/Vendor/Delete/${vendor.id}`,
    method: 'delete',
    token: token,
  });
  if (result && result.body) {
    return result.body;
  }
  return { code: result.ok ? 0 : result.code || 0, message: '', messages: [] };
}
