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

var Sessions = make(map[string]Session)

func NewSession() string {
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

func GetSession(r *http.Request, w http.ResponseWriter, cookieName string) *Session {
	c, err := r.Cookie(cookieName)
	if err != nil {
		sessionID := NewSession()
		s := Sessions[sessionID]
		c = &http.Cookie{
			Name:    cookieName,
			Value:   sessionID,
			Expires: time.Now().Add(s.ExpireTime),
		}
		http.SetCookie(w, c)
		return &s
	}
	if s, ok := Sessions[c.Value]; ok {
		s.IsNew = false
		return &s
	} else {
		sessionID := NewSession()
		s := Sessions[sessionID]
		c = &http.Cookie{
			Name:    cookieName,
			Value:   sessionID,
			Expires: time.Now().Add(s.ExpireTime),
		}
		http.SetCookie(w, c)
		return &s
	}
	return nil
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
