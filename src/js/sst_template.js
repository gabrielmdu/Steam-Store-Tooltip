export const sstTemplate = `<div class="steam-sst-theme">

    <div class="steam-sst-top">

        <div class="steam-sst-header-img">
            <div class="glide">
                <div class="glide__track" data-glide-el="track">
                    <ul class="glide__slides">
                        <li class="glide__slide">
                            <div class="steam-sst-carousel-img"></div>
                        </li>
                    </ul>
                </div>
                
                <div class="glide__arrows" data-glide-el="controls">
                    <button class="glide__arrow glide__arrow--left" data-glide-dir="<">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30" width="20" height="20"><path fill="#FFF" d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z"/></svg>
                    </button>
                    <button class="glide__arrow glide__arrow--right" data-glide-dir=">">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30" width="20" height="20"><path fill="#FFF" d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z"/></svg>
                    </button>
                </div>

                <div class="glide__bullets" data-glide-el="controls[nav]">
                    <button class="glide__bullet" data-glide-dir="=0"></button>
                </div>
            </div>

            <div class="steam-sst-user-data steam-sst-hidden"></div>
            <div class="steam-sst-metacritic steam-sst-hidden"><a></a></div>
        </div>

        <div class="steam-sst-top-right">
            <div class="steam-sst-name"></div>

            <div class="steam-sst-additional-info">
                <div class="steam-sst-release-date"></div>
                <div class="steam-sst-genres"></div>
                <div class="steam-sst-platforms"></div>
            </div>

            <div class="steam-sst-tags"></div>

            <div class="steam-sst-price-reviews-wrapper">
                <div class="steam-sst-price"></div>
                <div class="steam-sst-price-wrapper steam-sst-hidden">
                    <div class="steam-sst-discounted-price">
                        <div class="steam-sst-initial-price"></div>
                        <div class="steam-sst-final-price"></div>
                    </div>
                    <div class="steam-sst-percent"></div>
                </div>

                <div class="steam-sst-reviews">
                    <div class="steam-sst-loading steam-sst-no-margin"></div>
                    <img class="steam-sst-hidden" src="">
                    <span class="steam-sst-hidden"></span>
                </div>
            </div>

            <div class="steam-sst-categories-wrapper">
                <div class="steam-sst-categories"></div>
            </div>
        </div>
    </div>

    <div class="steam-sst-bottom">
        <div class="steam-sst-description"></div>
    </div>
</div>`;