export interface IVendor {
  _id: string;
  name: string;
  subdomain: string;
  storeUrl: string;
  template: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    logo: string;
    bannerImage: string;
    bannerText: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface ICreateVendorRequest {
  vendorName: string;
  ownerName: string;
  ownerEmail: string;
  password: string;
  subdomain: string;
  template: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    bannerText: string;
  };
}

export interface ITemplate {
  _id: string;
  name: string;
  identifier: string;
  description: string;
  previewImage: string;
  config: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}