# Материалы для подачи в Zepp App Store

appId **1124048** · версия **1.0.0** (code 1) · пакет `dist/1124048-Breath_Pacer-1.0.0-*.zab`

Форма: https://console.zepp.com/ → приложение → загрузить пакет → заполнить → *Submit for Approval*.
Модерация 1–5 рабочих дней.

---

## Файлы

| Поле формы | Файл |
|---|---|
| Application Package | `dist/1124048-Breath_Pacer-1.0.0-*.zab` (18 КБ, после `zeus prune --ip`) |
| Application Icon | `store-icon-240.png` — 240×240 PNG, круглая, прозрачный фон |
| Screenshots | `store/1-home.png` … `store/5-result.png` — 360×360 PNG, прозрачный фон |

Скриншоты собраны по правилу консоли для прямоугольных экранов: интерфейс по центру,
равные поля слева и справа, без полей сверху и снизу.

---

## Название

| Язык | App name |
|---|---|
| en-US | Breath Pacer |
| ru-RU | Ритм дыхания |

## Краткое описание (App profile)

**en-US** (71 зн.)
> Guided breathing paced by vibration.

**ru-RU** (56 зн.)
> Дыхание по ритму вибрации. Четыре техники, всё на часах.

## Подробное описание (App details) — лимит 600 знаков

**en-US** (575 зн.)

```
Vibration sets the rhythm, so you can close your eyes and still stay on pace. An expanding circle shows the phase and a distinct haptic marks every transition.

Four techniques: Box 4-4-4-4 for focus, 4-7-8 for falling asleep, Coherent 5-5 for balance, Calm 4-6 to settle quickly. Sessions of 1, 3, 5 or 10 minutes.

The summary shows your heart rate at the start and end, plus completed sessions and total minutes.

Runs entirely on the watch: no network, no phone app, no account.

A relaxation aid, not a medical device. The heart rate shown is not a clinical measurement.
```

**ru-RU** (564 зн.)

```
Ритм задаёт вибрация — можно закрыть глаза и не сбиться. Растущий круг показывает фазу, каждый переход отмечен отдельным сигналом.

Четыре техники: Квадрат 4-4-4-4 для концентрации, 4-7-8 для засыпания, Когерентное 5-5 для баланса, Успокоение 4-6 чтобы быстро успокоиться. Сессии на 1, 3, 5 или 10 минут.

На итоговом экране — пульс в начале и в конце, число сессий и суммарные минуты.

Работает полностью на часах: без сети, без приложения на телефоне, без аккаунта.

Средство для расслабления, не медицинское устройство. Пульс не является клиническим измерением.
```

## Features Descriptions

Перечень возможностей. Если поле ограничено по длине — брать короткий вариант ниже.

**en-US** (421 зн.)

```
• Four breathing techniques: Box 4-4-4-4, 4-7-8, Coherent 5-5, Calm 4-6
• A haptic cue on every phase change, so you can practise with your eyes closed
• An animated circle showing inhale, hold and exhale
• Session lengths of 1, 3, 5 and 10 minutes
• Heart rate measured at the start and end of a session
• Completed sessions and total minutes kept on the watch
• Fully offline: no network, no phone companion, no account
```

**ru-RU** (362 зн.)

```
• Четыре техники: Квадрат 4-4-4-4, 4-7-8, Когерентное 5-5, Успокоение 4-6
• Вибросигнал на каждой смене фазы — можно заниматься с закрытыми глазами
• Круг показывает вдох, задержку и выдох
• Сессии на 1, 3, 5 и 10 минут
• Пульс в начале и в конце сессии
• Число сессий и суммарные минуты хранятся на часах
• Полностью офлайн: без сети, без телефона, без аккаунта
```

### Короткий вариант, если стоит жёсткий лимит

**en-US** (133 зн.)
> Four breathing techniques paced by vibration, 1-10 minute sessions, heart rate before and after, on-watch stats. Works fully offline.

**ru-RU** (126 зн.)
> Четыре техники дыхания с вибро-ритмом, сессии на 1-10 минут, пульс до и после, статистика на часах. Работает полностью офлайн.

---

## Разрешения (Calling Permissions)

| Разрешение | Зачем |
|---|---|
| `data:user.hd.heart_rate` | Пульс в начале и в конце сессии на итоговом экране. Значения нигде не сохраняются. |
| `device:os.local_storage` | Выбранная техника, длительность и два счётчика статистики. |

## SDK

Сторонних SDK нет. Только `@zos/*` из платформы.

## Политика конфиденциальности

Текст целиком — в `PRIVACY.md`, вставляется в поле Privacy Statement как есть.
Контакт в тексте — в разделе Contact файла `PRIVACY.md`.

## Классификация

Health / Wellness — уточнить по списку в консоли.

---

## Перед подачей

- [ ] `npm test` проходит
- [ ] `zeus build` и **обязательно** `zeus prune --ip` (иначе в пакет уедет весь исходник)
- [ ] appId в `app.json` = 1124048, совпадает с приложением в консоли
- [ ] проверено на реальных часах

## Обновление версии

Поднять `app.version.code` и `app.version.name` в `app.json`, пересобрать,
в консоли — *Version Upgrade*.
