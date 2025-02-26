export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
  gender: string;
  language: string;
  password: string;
  role: string;
};

export type LoginUser = {
  email: string;
  password: string;
};

export type RegisterUser = {
  username: string;
  email: string;
  name: string;
  password: string;
  gender: string;
  phone: string;
  role?: string;
};
