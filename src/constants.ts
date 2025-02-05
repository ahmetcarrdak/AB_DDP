export interface DriverLicense {
    id: number;
    name: string;
}

export const driverLicenses: DriverLicense[] = [
    { id: 1, name: "A1" },
    { id: 2, name: "A2" },
    { id: 3, name: "A" },
    { id: 4, name: "B1" },
    { id: 5, name: "B" },
    { id: 6, name: "C1" },
    { id: 7, name: "C" },
    { id: 8, name: "D1" },
    { id: 9, name: "D" },
    { id: 10, name: "F" },
    { id: 11, name: "G" },
    { id: 12, name: "H" },
    { id: 13, name: "M" },
    { id: 14, name: "E" },
];

export const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];
export const educationLevels = [
    "İlkokul",
    "Ortaokul",
    "Lise",
    "Önlisans",
    "Lisans",
    "Yüksek Lisans",
    "Doktora",
];
export const shiftSchedules = ["Gündüz", "Gece", "Karma"];
