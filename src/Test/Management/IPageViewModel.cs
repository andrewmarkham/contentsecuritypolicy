using EPiServer.Core;

namespace Management
{
    public interface IPageViewModel<T> where T : IContent
    {
         T CurrentPage {get;}
    }

    public class PageViewModel<T> :IPageViewModel<T> where T : IContent
    {
        public PageViewModel(T currentPage)
        {
            
        }
         public T CurrentPage {get;}
    }
}