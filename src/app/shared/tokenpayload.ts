export interface UserResponse {
  Id: number;
  Classification: string;
  FirstName: string;
  SecondName: string;
  ThirdName: string;
  FamilyName: string;
  FullName: string;
  NationalId: string;
  BranchId: number | null;
  UserName: string;
  Password: string | null;
  Email: string;
  Phone: string;
  Phone2: string;
  UserType: number;
  RegisterDate: string;
  PassSalt: string | null;
  PassHash: string | null;
  IsDeleted: boolean;
  AddedBy: number;
  AddedAt: string;
  ShiftFrom: string;
  ShiftTo: string;
  SatShift: boolean;
  SunShift: boolean;
  MonShift: boolean;
  TueShift: boolean;
  WedShift: boolean;
  ThuShift: boolean;
  FriShift: boolean;
  IsLoggedIn: boolean;
  Img: string;
  Message: string;
  Token: string;
  ExperiencedInElec: boolean,
  ExperiencedInHybrd: boolean,
  ExperiencedInCountryId: number,
  Branch: {
    Id: number;
    BranchName: string | null;
    Message: string | null;
    AddedBy: number | null;
    AddedAt: string | null;
  };
}


export interface UserInfo {
  FullName: string;
  Img: string;
}
