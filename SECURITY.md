# Security Best Practices for Deployment

## ✅ What's Already Secure

1. ✓ `.env` files are in `.gitignore`
2. ✓ All sensitive data uses environment variables
3. ✓ JWT authentication implemented
4. ✓ Passwords are hashed with bcrypt
5. ✓ No hardcoded credentials in code

## ⚠️ Important Before Deployment

### 1. Update .env Files

**Backend (.env):**
```bash
# Generate strong JWT secret (32+ characters)
JWT_SECRET=use_openssl_rand_base64_32_to_generate

# Use strong database password
DB_PASSWORD=strong_random_password_here

# Production AWS credentials
AWS_ACCESS_KEY_ID=your_real_key
AWS_SECRET_ACCESS_KEY=your_real_secret
AWS_S3_BUCKET=your-production-bucket

# CORS - Set to your frontend domain
CORS_ORIGIN=https://yourdomain.com
```

**Frontend (.env.production):**
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

### 2. Security Checklist for AWS

- [ ] Use AWS Secrets Manager or Parameter Store for sensitive data
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure security groups to restrict access
- [ ] Use IAM roles instead of hardcoded AWS credentials
- [ ] Enable AWS WAF for protection
- [ ] Set up CloudWatch for monitoring
- [ ] Configure proper CORS settings
- [ ] Use environment-specific .env files

### 3. GitHub Security

- [ ] Verify `.env` is in `.gitignore`
- [ ] Never commit `.env` files
- [ ] Use GitHub Secrets for CI/CD
- [ ] Enable branch protection rules
- [ ] Add a security policy (SECURITY.md)

### 4. Database Security

- [ ] Use RDS with encryption at rest
- [ ] Restrict database access to VPC only
- [ ] Regular backups enabled
- [ ] Use read replicas for scaling
- [ ] Monitor with CloudWatch

### 5. Additional Recommendations

**Add rate limiting:**
```javascript
// Backend: install express-rate-limit
npm install express-rate-limit
```

**Add helmet for security headers:**
```javascript
// Backend: install helmet
npm install helmet
```

**Enable HTTPS redirect:**
```javascript
// Backend middleware
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

## 🚀 AWS Deployment Checklist

### Backend (EC2 or Elastic Beanstalk)
1. Use IAM roles instead of access keys
2. Store secrets in AWS Secrets Manager
3. Configure security groups
4. Enable CloudWatch logs
5. Set up Auto Scaling

### Frontend (S3 + CloudFront)
1. Enable CloudFront with HTTPS
2. Configure S3 bucket policies
3. Set up CloudFront invalidation
4. Add custom domain with Route 53

### Database (RDS PostgreSQL)
1. Use VPC for isolation
2. Enable automated backups
3. Use encryption at rest
4. Restrict access to backend only

## 📝 Environment Variables Summary

**Never commit:**
- ❌ JWT_SECRET
- ❌ DB_PASSWORD
- ❌ AWS credentials
- ❌ Any API keys

**Safe to commit:**
- ✅ `.env.example` files
- ✅ Configuration templates
- ✅ Documentation

## 🔐 Generate Secure Secrets

```bash
# JWT Secret (Unix/Mac)
openssl rand -base64 32

# JWT Secret (Windows PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Database Password
openssl rand -base64 24
```

## ⚡ Quick Security Scan

Before pushing to GitHub, run:
```bash
# Check for exposed secrets
git grep -i "password\|secret\|key" -- ':!*.md' ':!.env.example'

# Verify .env is ignored
git check-ignore .env
```
