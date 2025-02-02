export interface CharStats {
  exp: number; // Досвід
  hp: number; // Очки здоров'я
  id: number; // Унікальний ідентифікатор персонажа
  level: number; // Основний рівень
  level2: number; // Додатковий рівень або підрівень
  mp: number; // Магічна енергія або мана
  name: string; // Ім'я персонажа
  race: Race; // Раса персонажа
  reputation: number; // Репутація персонажа
  sp: number; // Очки навичок або здібностей
}

export enum Race {
  Warrior = 0,
  Mage = 1,
  Druid = 3,
  Werewolf = 4,
  Archer = 6,
  Priest = 7,
}
