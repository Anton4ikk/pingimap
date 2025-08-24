<div align="center">

<img src="./media/logo.png" alt="PingiMap Logo" width="300" height="300" style="border-radius: 20px;">

## 🌟 [**LIVE DEMO - pingimap.com**](https://pingimap.com) 🌟

# 🚀 PingiMap

**A modern service monitoring platform with real-time status tracking, interactive dashboard, and role-based access control.**

*Built with Docker, SvelteKit, and Fastify*

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](docker-compose.yml)
[![Node.js](https://img.shields.io/badge/node-20+-green.svg)](package.json)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](DEPLOYMENT.md) • [🛠️ Development](#️-development) • [🐛 Issues](https://github.com/Anton4ikk/pingimap/issues)

</div>

## ✨ Features

- **🔍 Real-time Monitoring** - Automatic health checks every 30 seconds
- **📊 Interactive Dashboard** - Visual status grid with color-coded tiles
- **👥 Role-Based Access** - Public dashboard + admin authentication
- **📱 Mobile Responsive** - Touch-friendly interface for all devices
- **🚀 High Performance** - Optimized for 100+ monitored services
- **🔒 Security Hardened** - JWT authentication, Docker security best practices
- **📦 Easy Deployment** - One-command Docker setup

## 🚀 Quick Start

### Requirements
- **Docker** and **Docker Compose**
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Anton4ikk/pingimap.git
cd pingimap

# 2. Configure environment (REQUIRED)
cp .env.example .env
nano .env
# Set secure passwords:
# - ADMIN_PASSWORD=your-secure-password
# - JWT_SECRET=your-32-character-secret
# - POSTGRES_PASSWORD=your-db-password

# 3. Build and start all services (clean build)
docker compose build --no-cache
docker compose up -d

# 4. Verify services are running
docker compose ps

# 5. Optional: Add example services
docker compose exec api pnpm --filter=@pingimap/api seed
```

### 🌐 Access Your Installation
- **Dashboard**: http://localhost:3000 (public access)
- **Admin Login**: Click "Login" in header, use your ADMIN_PASSWORD
- **API Health**: http://localhost:3001/health
- **System Info**: http://localhost:3000/info

## 📖 User Guide

### Adding Services (Admin Required)
1. Click **"Login"** in header → enter your admin password
2. Navigate to **"Services"** (appears after login)
3. Click **"Add Service"** → enter name and URL
4. Service monitoring starts automatically

### Viewing Service Status
- **Dark Green tiles** = Service FAST (0-1000ms response)
- **Light Green tiles** = Service NORMAL (1001-2000ms response)
- **Yellow tiles** = Service SLOW (2001-5000ms response)
- **Red tiles** = Service DOWN (>5000ms or error)
- **Gray tiles** = Not yet checked
- Hover/tap tiles for detailed information

### Bulk Import Services (Admin)
1. Go to **Services** → **"Import Services"**
2. Upload JSON file with format:
```json
[
  {"name": "Google", "url": "https://google.com"},
  {"name": "GitHub", "url": "https://github.com"}
]
```

## 🏗️ Architecture

### Microservices Stack
- **Web Frontend**: SvelteKit + TypeScript (Port 3000)
- **API Backend**: Fastify + PostgreSQL + NATS (Port 3001)
- **Database**: PostgreSQL 16 (Port 5432)
- **Message Queue**: NATS (Ports 4222, 8222)

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │───▶│   API Backend   │───▶│   PostgreSQL    │
│   (SvelteKit)   │    │   (Fastify)     │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │      NATS       │
                       │  Message Queue  │
                       └─────────────────┘
```

## 🔧 Configuration

### Environment Variables (.env file)

```bash
# Authentication (REQUIRED - no defaults)
ADMIN_PASSWORD=your-secure-admin-password
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Database (REQUIRED - no defaults)
POSTGRES_PASSWORD=your-secure-db-password

# Application Settings
NODE_ENV=production
WEB_PORT=3000    # 80 for HTTP, 443 for HTTPS in production
API_PORT=3001

# Monitoring Thresholds
PING_TIMEOUT_MS=5000      # Max response time before timeout
FAST_THRESHOLD_MS=1000    # Dark green status (0-1000ms)
NORMAL_THRESHOLD_MS=2000  # Light green status (1001-2000ms)
SLOW_THRESHOLD_MS=4000    # Yellow status (2001-5000ms)
                          # Red status (>5000ms or timeout/error)
```

### Port Configuration
| Service | Port | Description |
|---------|------|-------------|
| Web Frontend | 3000 | Public dashboard + admin interface |
| API Backend | 3001 | REST API and health checks |
| PostgreSQL | 5432 | Database |
| NATS Client | 4222 | Message queue |
| NATS HTTP | 8222 | NATS monitoring |

## 📊 API Endpoints

### Public Endpoints
```bash
GET  /health                    # Service health status
GET  /api/services              # List all monitored services
GET  /api/config                # System configuration
GET  /api/services/:id/checks   # Service check history
```

### Admin Endpoints (Authentication Required)
```bash
POST /api/auth/login            # Admin login
GET  /api/auth/status           # Check auth status
POST /api/services              # Add new service
PUT  /api/services/:id          # Update service
DELETE /api/services/:id        # Remove service
POST /api/services/bulk         # Bulk import services
```

## 🛠️ Development

### Prerequisites
- **Node.js** 18+
- **pnpm** 8+
- **Docker** and **Docker Compose**

### Development Setup

```bash
# 1. Clone and navigate to project
git clone https://github.com/Anton4ikk/pingimap.git
cd pingimap

# 2. IMPORTANT: Create environment file
cp .env.example .env
nano .env
# Configure required variables:
# - ADMIN_PASSWORD=dev-password-123
# - JWT_SECRET=development-secret-key-32-chars
# - POSTGRES_PASSWORD=dev-db-password

# 3. Start containerized development environment
docker compose build --no-cache
docker compose up -d

# 4. View logs and verify services
docker compose logs -f

# 5. Optional: Local development (for IDE support)
pnpm install

# 6. Individual service development
cd apps/web && pnpm dev      # Frontend on localhost:5173
cd apps/api && pnpm dev      # Backend on localhost:3001

# 7. Database operations
cd apps/api
pnpm dlx prisma generate     # Generate Prisma client
pnpm dlx prisma studio       # Database GUI on localhost:5555
pnpm dlx prisma migrate dev  # Run database migrations
```

> **⚠️ Important**: Always copy your `.env` file from `.env.example` and configure it properly. The `.env` file is git-ignored to prevent accidentally committing secrets.

### Project Structure
```
pingimap/
├── apps/
│   ├── api/            # Fastify backend + monitoring
│   ├── web/            # SvelteKit frontend
│   └── agent/          # Background processing
├── packages/
│   ├── config/         # Shared ESLint/Prettier
│   ├── env-config/     # Environment validation
│   ├── lib/            # Shared utilities
│   └── tsconfig/       # TypeScript configs
├── scripts/            # Database seeding
├── docker-compose.yml  # Container orchestration
└── .env                # Environment configuration
```

## 🔒 Security

### Implemented Security Features
- **JWT Authentication** for admin operations
- **No default credentials** (prevents accidental insecure deployments)
- **Docker security hardening** (non-root users, read-only filesystems)
- **Input validation** and sanitization
- **CORS protection**
- **Environment isolation**

### Production Security Checklist
- [ ] Set strong, unique passwords in `.env`
- [ ] Use HTTPS with reverse proxy (nginx/caddy)
- [ ] Configure firewall rules
- [ ] Set up log monitoring
- [ ] Regular security updates
- [ ] Database backups

## 🐛 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check for port conflicts and rebuild
docker compose down
docker compose build --no-cache
docker compose up -d

# View logs
docker compose logs
```

**Database connection errors:**
```bash
# Check PostgreSQL health
docker-compose logs postgres
docker-compose exec postgres pg_isready -U pingimap
```

**Reset everything:**
```bash
# Nuclear option - removes all data and rebuilds
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Health Checks

```bash
# Verify all services
curl http://localhost:3001/health
curl http://localhost:3000
curl http://localhost:8222/varz

# Test API functionality
curl http://localhost:3001/api/services
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Setup** development environment (`docker compose up -d`)
4. **Make** your changes with tests
5. **Commit** changes (`git commit -m 'Add amazing feature'`)
6. **Push** to branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Development Guidelines
- Follow existing code style (ESLint/Prettier configured)
- Add tests for new features
- Update documentation
- Ensure Docker health checks pass
- Test with both Docker and native development

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with amazing open-source tools:
- [SvelteKit](https://kit.svelte.dev/) - Full-stack web framework
- [Fastify](https://www.fastify.io/) - Fast web framework
- [PostgreSQL](https://www.postgresql.org/) - Reliable database
- [Docker](https://www.docker.com/) - Containerization platform
- [NATS](https://nats.io/) - Message streaming system

---

⭐ **Star this repository if you find PingiMap useful!**

🐛 **Found a bug?** [Open an issue](https://github.com/Anton4ikk/pingimap/issues)

💡 **Have ideas?** [Start a discussion](https://github.com/Anton4ikk/pingimap/discussions)