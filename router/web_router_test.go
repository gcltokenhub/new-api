package router

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestLegacyFaviconRedirectsToTokenFactoryMark(t *testing.T) {
	router := gin.New()
	SetWebRouter(router, WebAssets{IndexPage: []byte("dashboard")}, func(c *gin.Context) { c.Next() })

	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/favicon.ico", nil))

	require.Equal(t, http.StatusTemporaryRedirect, response.Code)
	require.Equal(t, "/token-factory-mark.svg", response.Header().Get("Location"))
}
