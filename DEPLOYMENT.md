# 🚀 PingiMap Production Deployment Guide

Complete guide for deploying PingiMap in production environments with security best practices and HTTPS configuration.

## 📋 Production Deployment Overview

PingiMap uses a unified deployment model with role-based access control:
- **Public Dashboard** - Read-only service status for all visitors
- **Admin Authentication** - JWT-based login for service management
- **Docker Containerized** - All services run in secure containers

## 🛠️ Production Setup

### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Docker & Docker Compose installed
- Domain name pointed to your server
- Firewall configured (ports 80, 443, 22)

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Logout and login to apply docker group changes
```

### Step 2: Deploy PingiMap

```bash
# Clone repository
git clone https://github.com/Anton4ikk/pingimap.git
cd pingimap

# Configure environment for production
cp .env.example .env
nano .env
```

### Step 3: Production Environment Configuration

**⚠️ CRITICAL: Copy and configure environment file with secure credentials**

Copy the example environment file and configure it:

```bash
cp .env.example .env
nano .env
```

**Required Configuration:**

```bash
# Authentication (REQUIRED - set strong passwords)
ADMIN_PASSWORD=your-very-secure-admin-password-123!
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Database (REQUIRED - set secure password)
POSTGRES_PASSWORD=your-secure-database-password-456!

# Production Settings
NODE_ENV=production
WEB_PORT=3000    # Internal port (nginx will proxy)
API_PORT=3001    # Internal port (nginx will proxy)

# Monitoring Configuration
PING_TIMEOUT_MS=5000
FAST_THRESHOLD_MS=1000
SLOW_THRESHOLD_MS=2000

# Database Ports (keep internal)
POSTGRES_PORT=5432
NATS_CLIENT_PORT=4222
NATS_HTTP_PORT=8222
NATS_CLUSTER_PORT=6222
```

### Step 4: Start Services

```bash
# Build and start all services (fresh build)
docker compose build --no-cache
docker compose up -d

# Verify all services are healthy
docker compose ps

# Check logs
docker compose logs -f
```

## 🌐 HTTPS Setup with Nginx

### Install Nginx and Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Configure Nginx

Create `/etc/nginx/sites-available/domain.com`:

```nginx
server {
    listen 80;
    server_name domain.com www.domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name domain.com www.domain.com;

    # SSL Configuration (certbot will add these)
    ssl_certificate /etc/letsencrypt/live/domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain.com/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Web Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SvelteKit internal API routes (handled by web frontend)
    location /api/info {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API routes
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Direct API endpoints (health, info)
    location ~ ^/(health|info)$ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable Site and Get SSL Certificate

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pingimap.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d pingimap.com -d www.pingimap.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔒 Production Security Configuration

### Firewall Setup

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Verify rules
sudo ufw status
```

### Security Hardening

1. **Change Default SSH Port** (optional but recommended):
```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
sudo systemctl restart ssh
```

2. **Disable Docker Direct Access**:
```bash
# Ensure these ports are NOT exposed in docker-compose.yml:
# - PostgreSQL (5432)
# - NATS (4222, 8222)
# Only expose web (3000) and api (3001) to localhost
```

3. **Set Strong Environment Variables**:
```bash
# Generate secure passwords
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For passwords
```

### Docker Security

The application includes these security measures:
- **Non-root users** in containers
- **Read-only filesystems** where possible
- **No new privileges** flag
- **Minimal container images**
- **Health checks** for all services

## 🔍 Monitoring & Logging

### Container Health Monitoring

```bash
# Check service health
docker compose ps
docker compose logs --tail=50 -f

# Monitor resource usage
docker stats

# Check specific service logs
docker compose logs -f web
docker compose logs -f api
```

### System Health Endpoints

```bash
# Check application health
curl https://pingimap.com/api/health
curl https://pingimap.com/info

# Check SSL certificate
curl -I https://pingimap.com
```

### Log Management

```bash
# Set up log rotation for Docker
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

## 🚀 Deployment Verification

### Complete Deployment Test

```bash
# 1. Test HTTP to HTTPS redirect
curl -I http://pingimap.com

# 2. Test HTTPS access
curl -I https://pingimap.com

# 3. Test API health
curl https://pingimap.com/api/health

# 4. Test admin authentication
curl -X POST https://pingimap.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'

# 5. Test service management (with token from step 4)
curl -X POST https://pingimap.com/api/services \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Service","url":"https://google.com"}'
```

## 🔄 Maintenance & Updates

### Backup Strategy

```bash
# Backup database
docker compose exec postgres pg_dump -U pingimap pingimap > backup.sql

# Backup configuration
cp .env .env.backup
cp docker-compose.yml docker-compose.yml.backup
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart (clean build)
docker compose down
docker compose build --no-cache
docker compose up -d

# Verify health
docker compose ps
```

### Database Migrations

```bash
# Run database migrations (if needed)
docker compose exec api pnpm --filter=@pingimap/api prisma migrate deploy
```

## 📊 Performance Optimization

### For High-Load Production

```bash
# Increase container resources if needed
# Edit docker-compose.yml and add:

services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
  web:
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
```

### Monitoring Thresholds

Adjust monitoring settings for your network:

```bash
# For slower networks, increase timeouts
PING_TIMEOUT_MS=10000
FAST_THRESHOLD_MS=2000
SLOW_THRESHOLD_MS=5000
```

## 🆘 Troubleshooting

### Common Production Issues

**1. Services Not Starting**
```bash
# Check Docker daemon
sudo systemctl status docker

# Check logs and rebuild
docker compose logs

# Restart everything with clean build
docker compose down
docker compose build --no-cache
docker compose up -d
```

**2. SSL Issues**
```bash
# Test SSL configuration
sudo nginx -t
sudo certbot certificates

# Renew SSL manually
sudo certbot renew
```

**3. Database Connection Issues**
```bash
# Check PostgreSQL container
docker compose logs postgres

# Test database connection
docker compose exec postgres pg_isready -U pingimap
```

**4. Permission Issues**
```bash
# Fix Docker permissions
sudo chown -R $USER:$USER .
sudo chmod +x scripts/*
```

### Emergency Procedures

**Complete Reset (Nuclear Option)**
```bash
# This removes ALL data - use with caution
docker compose down -v
docker system prune -a
git pull origin main
docker compose build --no-cache
docker compose up -d
```

## 📋 Production Checklist

Before going live, verify:

- [ ] **Strong credentials** set in `.env` file
- [ ] **HTTPS** configured with valid SSL certificate
- [ ] **Firewall** configured (only ports 22, 80, 443 open)
- [ ] **Database backups** configured
- [ ] **Log rotation** configured
- [ ] **Monitoring** set up (health checks working)
- [ ] **DNS** configured correctly
- [ ] **Admin login** tested
- [ ] **Service creation** tested
- [ ] **Auto-renewal** for SSL certificate tested

## 🌟 Performance Tips

1. **Use SSD storage** for database performance
2. **Configure swap** if RAM is limited
3. **Monitor container resources** with `docker stats`
4. **Set up monitoring** (Prometheus/Grafana)
5. **Configure log aggregation** (ELK stack)

## 📚 Additional Resources

- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Security Headers](https://observatory.mozilla.org/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

🎉 **Congratulations! Your PingiMap instance is now running securely in production.**

For questions or issues, please [open a GitHub issue](https://github.com/Anton4ikk/pingimap/issues).