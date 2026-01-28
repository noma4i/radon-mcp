# Radon MCP Server

> **Правила документации:**
> - Максимум 300 строк, БЕЗ примеров кода
> - Только текущее состояние, БЕЗ истории изменений
> - Таблицы: файл → назначение → API

## Overview

- **Цель**: MCP сервер для интеграции с Radon IDE (React Native)
- **Принцип**: Автодетекция Radon процессов, прямое взаимодействие с симулятором и Metro
- **Версия**: 0.1.0
- **Инструменты**: 6

## Архитектура

```
┌─────────────────┐    MCP/stdio    ┌──────────────────┐
│   Claude Code   │◄───────────────►│   radon-mcp      │
└─────────────────┘                 └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
           ┌────────────────┐      ┌─────────────────┐      ┌─────────────────┐
           │ npm registry   │      │ xcrun simctl    │      │ Metro HTTP API  │
           └────────────────┘      └─────────────────┘      └─────────────────┘
```

## Файлы

| Файл | Назначение | API |
|------|------------|-----|
| `src/index.js` | Entry point | `startServer()` |
| `src/lib/server.js` | MCP Server setup | `createServer()`, `startServer()` |
| `src/lib/tool-registry.js` | Регистрация инструментов | `ALL_TOOLS`, `getToolHandler()` |
| `src/lib/radon-detector.js` | Автодетекция Radon | `detectRadonDevice()`, `detectMetroPort()`, `getRadonContext()` |
| `src/lib/pagination.js` | Пагинация и лимиты | `truncateLines()`, `paginateLines()`, `filterLines()`, `truncateChars()` |
| `src/lib/device-bridge.js` | xcrun simctl wrapper | `captureScreenshot()`, `getDeviceLogs()`, `reloadApp()` |
| `src/lib/metro-client.js` | Metro HTTP client | `getMetroStatus()`, `reloadMetro()`, `getMetroLogs()` |
| `src/tools/docs.js` | Документация | `getLibraryDescription()`, `queryDocumentation()` |
| `src/tools/device.js` | Устройства | `viewScreenshot()`, `reloadApplication()` |
| `src/tools/logs.js` | Логи | `viewApplicationLogs()` |
| `src/tools/components.js` | Component tree | `viewComponentTree()` |

## Инструменты (6 шт.)

| Инструмент | Назначение | Параметры |
|-----------|------------|-----------|
| `query_documentation` | Поиск в React Native/Expo docs | `text`, `source?` |
| `view_screenshot` | Скриншот симулятора (MCP image) | — |
| `reload_application` | Перезагрузка приложения | `reloadMethod?` (reloadJs, restartProcess, rebuild) |
| `view_application_logs` | Логи Metro и устройства | `source?`, `mode?`, `filter?`, `offset?`, `limit?`, `timeout?` |
| `get_library_description` | Информация о npm пакете | `library_npm_name`, `readmeLimit?` |
| `view_component_tree` | Component tree (базовый) | `depth?` |

## MCP Content Format

Все инструменты возвращают MCP-совместимый формат `{ content: [...] }`:

| Тип | Описание | Использование |
|-----|----------|---------------|
| `type: 'text'` | Текстовый ответ | Логи, описания, ошибки |
| `type: 'image'` | Base64 изображение | `view_screenshot` |

Формат идентичен оригинальному Radon IDE extension.

## Автодетекция

Сервер автоматически определяет:
- **Device ID**: из процесса `simulator-server-macos`
- **Device Set**: `/Users/.../Library/Caches/com.swmansion.radon-ide/Devices/iOS`
- **Metro Port**: из процесса или сканирование портов 8081, 50377

## Команды

| Команда | Назначение |
|---------|------------|
| `yarn build` | Сборка (src/ → dist/) |
| `yarn start` | Запуск сервера |
| `yarn dev` | Сборка + запуск |

## Конфигурация Claude Code

```json
{
  "mcpServers": {
    "radon": {
      "command": "node",
      "args": ["/Users/noma4i/work/radon-mcp/dist/index.js"]
    }
  }
}
```

## Пагинация и лимиты

Инструменты с большими данными автоматически обрезают вывод.

### view_application_logs

| Режим | Описание | Когда использовать |
|-------|----------|-------------------|
| `auto` | 50 первых + 150 последних строк | Быстрый обзор (по умолчанию) |
| `search` | Grep по regex filter | Поиск ошибок: `filter:"error\|Error"` |
| `paginate` | offset + limit | Чтение секций: `offset:100 limit:100` |

**Response metadata:**
```
{"mode":"auto","truncated":true}
{"mode":"search","matched":42,"total":5000}
{"mode":"paginate","offset":100,"limit":100,"total":5000,"hasMore":true}
```

### get_library_description

| Параметр | Default | Описание |
|----------|---------|----------|
| `readmeLimit` | 5000 | Макс символов README |

## Связи

- Импорт: `@modelcontextprotocol/sdk`
- Экспорт: MCP tools через stdio transport
- Внешние API: npm registry, xcrun simctl, Metro HTTP
