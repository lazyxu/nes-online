package koala

import (
	"errors"
	"net/http"
	"time"
)

type Session struct {
	ID         string
	CookieName string
	Values     map[string]interface{}
	UpdateTime time.Time
	ExpireTime time.Duration
	IsNew      bool
}

// Sessions x
var Sessions = make(map[string]Session)

func newSession() string {
	sessionID := HashString(time.Now().Format(time.UnixDate))
	s := Session{
		ID:         sessionID,
		Values:     make(map[string]interface{}),
		UpdateTime: time.Now(),
		ExpireTime: 3600 * time.Second,
		IsNew:      true,
	}
	Sessions[sessionID] = s
	return sessionID
}

// ExistSession 判断是否登录
func ExistSession(r *http.Request, cookieName string) bool {
	c, err := r.Cookie(cookieName)
	if err != nil {
		return false
	}
	if _, ok := Sessions[c.Value]; ok {
		return true
	}
	return false
}

// PeekSession 如果有Session则直接返回,否则返回nil
func PeekSession(r *http.Request, cookieName string) *Session {
	c, err := r.Cookie(cookieName)
	if err != nil {
		return nil
	}
	if s, ok := Sessions[c.Value]; ok {
		s.IsNew = false
		return &s
	}
	return nil
}

// CheckSession 检查某项值，判断用户类别
func CheckSession(r *http.Request, m map[string]interface{}) bool {
	session := PeekSession(r, "sessionID")
	if session == nil {
		return false
	}
	for k, v := range m {
		if val, ok := session.Values[k]; ok {
			if v != val {
				return false
			}
		} else {
			return false
		}
	}
	return true
}

// GetSessionValue 获取session中的某个值，如果没有则返回nil
func GetSessionValue(r *http.Request, cookieName string, key string) interface{} {
	session := PeekSession(r, cookieName)
	// log.Println(session)
	if session != nil {
		return session.Values[key]
	}
	return nil
}

// GetSession 创建一个Session，如果存在直接返回
func GetSession(r *http.Request, w http.ResponseWriter, cookieName string) *Session {
	c, err := r.Cookie(cookieName)
	if err != nil {
		sessionID := newSession()
		s := Sessions[sessionID]
		c = &http.Cookie{
			Name:    cookieName,
			Value:   sessionID,
			Expires: time.Now().Add(s.ExpireTime),
			Path:    "/",
		}
		http.SetCookie(w, c)
		return &s
	}
	if s, ok := Sessions[c.Value]; ok {
		s.IsNew = false
		return &s
	}
	sessionID := newSession()
	s := Sessions[sessionID]
	c = &http.Cookie{
		Name:    cookieName,
		Value:   sessionID,
		Expires: time.Now().Add(s.ExpireTime),
		Path:    "/",
	}
	http.SetCookie(w, c)
	return &s
}

func (s *Session) UpdateExpireTime(r *http.Request, w http.ResponseWriter) error {
	c, _ := r.Cookie(s.CookieName)
	c.Expires = time.Now().Add(s.ExpireTime)
	http.SetCookie(w, c)
	s.UpdateTime = time.Now()
	if s.UpdateTime.Add(s.ExpireTime).Unix() < time.Now().Unix() {
		s.Destory()
		return errors.New("Session is expired")
	}
	return nil
}

func (s *Session) Destory() error {
	delete(Sessions, s.ID)
	return nil
}

func DestorySession(r *http.Request, w http.ResponseWriter, cookieName string) error {
	s := PeekSession(r, cookieName)
	if s != nil {
		delete(Sessions, s.ID)
	}
	cookie := http.Cookie{
		Name:   cookieName,
		Path:   "/",
		MaxAge: -1,
	}
	http.SetCookie(w, &cookie)
	return nil
}
